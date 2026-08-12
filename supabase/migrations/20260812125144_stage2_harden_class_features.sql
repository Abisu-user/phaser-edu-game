-- Stage 2: protect class content, submissions, and role-changing profile fields.
-- Apply before deploying the matching frontend RPC calls.

create schema if not exists private;
revoke all on schema private from public;

-- Private policy helpers avoid recursive RLS checks against profiles.
create or replace function private.is_class_member(p_class_code text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null
     and exists (
       select 1
       from public.profiles p
       where p.id = (select auth.uid())
         and p.class_code = p_class_code
         and p.status = 'active'
     );
$$;

create or replace function private.is_teacher_of_class(p_class_code text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (select public.app_role()) = 'teacher'
     and exists (
       select 1
       from public.profiles p
       where p.id = (select auth.uid())
         and p.class_code = p_class_code
         and p.role = 'teacher'
         and p.status = 'active'
     );
$$;

create or replace function private.is_teacher_of_poll(p_poll_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.polls poll
    where poll.id = p_poll_id
      and (select private.is_teacher_of_class(poll.class_code))
  );
$$;

create or replace function private.is_teacher_of_survey(p_survey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.surveys survey
    where survey.id = p_survey_id
      and (select private.is_teacher_of_class(survey.class_code))
  );
$$;

revoke all on function private.is_class_member(text) from public, anon, authenticated;
revoke all on function private.is_teacher_of_class(text) from public, anon, authenticated;
revoke all on function private.is_teacher_of_poll(uuid) from public, anon, authenticated;
revoke all on function private.is_teacher_of_survey(uuid) from public, anon, authenticated;

-- Keep roles, account state, and class membership out of direct browser writes.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if current_setting('app.profile_internal_write', true) = 'on'
     or (select public.app_role()) = 'admin' then
    return new;
  end if;

  if new.id = (select auth.uid()) then
    if new.id is distinct from old.id
       or new.role is distinct from old.role
       or new.status is distinct from old.status
       or new.email is distinct from old.email
       or new.class_name is distinct from old.class_name
       or new.class_code is distinct from old.class_code
       or new.is_assistant is distinct from old.is_assistant then
      raise exception 'Sensitive profile fields must be changed through an approved workflow';
    end if;
    return new;
  end if;

  if old.role = 'student'
     and (select private.is_teacher_of_class(old.class_code)) then
    if (to_jsonb(new) - array['status', 'is_assistant'])
       is distinct from (to_jsonb(old) - array['status', 'is_assistant']) then
      raise exception 'Teachers may only change student access status or assistant assignment';
    end if;
    if new.status not in ('active', 'banned') then
      raise exception 'Invalid student account status';
    end if;
    return new;
  end if;

  raise exception 'Not allowed to update this profile';
end;
$$;

drop trigger if exists profiles_guard_sensitive_fields on public.profiles;
create trigger profiles_guard_sensitive_fields
before update on public.profiles
for each row execute function public.guard_profile_update();

revoke all on function public.guard_profile_update() from public, anon, authenticated;

-- Class membership and account requests are server-validated operations.
create or replace function public.join_class_by_code(p_class_code text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_name text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select p.class_name into v_class_name
  from public.profiles p
  where p.class_code = upper(trim(p_class_code))
    and p.role = 'teacher'
    and p.status = 'active'
  limit 1;

  if v_class_name is null then
    raise exception 'Class code not found';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set class_code = upper(trim(p_class_code)), class_name = v_class_name, is_assistant = false
  where id = (select auth.uid());

  return v_class_name;
end;
$$;

create or replace function public.leave_current_class()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set class_code = null, class_name = null, is_assistant = false
  where id = (select auth.uid());
end;
$$;

create or replace function public.create_teacher_class(p_class_name text)
returns table(class_name text, class_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
  v_attempt integer := 0;
begin
  if (select public.app_role()) <> 'teacher' then
    raise exception 'Only teachers can create a class';
  end if;
  if char_length(trim(coalesce(p_class_name, ''))) not between 1 and 80 then
    raise exception 'Class name must contain 1 to 80 characters';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1 from public.profiles p
      where p.class_code = v_code and p.role = 'teacher'
    );
    if v_attempt >= 10 then
      raise exception 'Unable to generate a unique class code';
    end if;
  end loop;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set class_name = trim(p_class_name), class_code = v_code
  where id = (select auth.uid());

  return query select trim(p_class_name), v_code;
end;
$$;

create or replace function public.teacher_set_student_access(
  p_student_id uuid,
  p_status text default null,
  p_is_assistant boolean default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_code text;
begin
  select class_code into v_class_code
  from public.profiles
  where id = (select auth.uid());

  if v_class_code is null or not (select private.is_teacher_of_class(v_class_code)) then
    raise exception 'Only the class teacher can update student access';
  end if;
  if p_status is not null and p_status not in ('active', 'banned') then
    raise exception 'Invalid student account status';
  end if;

  update public.profiles
  set status = coalesce(p_status, status),
      is_assistant = coalesce(p_is_assistant, is_assistant)
  where id = p_student_id
    and class_code = v_class_code
    and role = 'student';

  if not found then
    raise exception 'Student not found in this class';
  end if;
end;
$$;

create or replace function public.request_teacher_role()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select public.app_role()) <> 'student' then
    raise exception 'Only student accounts can submit a teacher application';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set status = 'pending'
  where id = (select auth.uid());
end;
$$;

-- Preserve the existing teacher workflows while allowing the profile guard.
create or replace function public.update_class_name_by_code(p_class_code text, p_new_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if char_length(trim(coalesce(p_new_name, ''))) not between 1 and 80
     or not (select private.is_teacher_of_class(p_class_code)) then
    raise exception 'Not allowed to rename this class';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set class_name = trim(p_new_name)
  where class_code = p_class_code;
end;
$$;

create or replace function public.disband_class_by_code(p_class_code text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not (select private.is_teacher_of_class(p_class_code)) then
    raise exception 'Not allowed to disband this class';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);
  update public.profiles
  set class_name = null, class_code = null, is_assistant = false
  where class_code = p_class_code;
end;
$$;

-- Server-side submissions prevent cross-class writes, forged user IDs, and repeat votes.
alter table public.poll_votes drop constraint if exists poll_votes_poll_id_user_id_key;
alter table public.poll_votes add constraint poll_votes_poll_id_user_id_option_id_key unique (poll_id, user_id, option_id);

create or replace function public.cast_poll_vote(p_poll_id uuid, p_option_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_multiple boolean := false;
  v_max_choices integer := 1;
  v_option_count integer;
begin
  if (select auth.uid()) is null or coalesce(cardinality(p_option_ids), 0) = 0 then
    raise exception 'A signed-in user and at least one option are required';
  end if;

  select coalesce((poll.settings ->> 'isMultipleChoice')::boolean, false),
         greatest(1, coalesce((poll.settings ->> 'maxChoices')::integer, 1))
  into v_is_multiple, v_max_choices
  from public.polls poll
  where poll.id = p_poll_id
    and poll.status = 'active'
    and (select private.is_class_member(poll.class_code));

  if not found then
    raise exception 'Poll is not available to this user';
  end if;
  if cardinality(p_option_ids) <> cardinality(array(select distinct x from unnest(p_option_ids) x)) then
    raise exception 'Duplicate options are not allowed';
  end if;
  if (not v_is_multiple and cardinality(p_option_ids) <> 1)
     or cardinality(p_option_ids) > v_max_choices then
    raise exception 'Invalid number of selected options';
  end if;
  if exists (select 1 from public.poll_votes where poll_id = p_poll_id and user_id = (select auth.uid())) then
    raise exception 'You have already voted in this poll';
  end if;

  select count(*) into v_option_count
  from public.poll_options
  where poll_id = p_poll_id and id = any(p_option_ids);
  if v_option_count <> cardinality(p_option_ids) then
    raise exception 'One or more selected options do not belong to this poll';
  end if;

  insert into public.poll_votes (poll_id, option_id, user_id)
  select p_poll_id, x, (select auth.uid()) from unnest(p_option_ids) x;

  return cardinality(p_option_ids);
end;
$$;

create or replace function public.get_poll_vote_summary(p_poll_ids uuid[])
returns table(poll_id uuid, option_id uuid, vote_count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select v.poll_id, v.option_id, count(*)::bigint
  from public.poll_votes v
  join public.polls p on p.id = v.poll_id
  where v.poll_id = any(p_poll_ids)
    and p.status in ('active', 'ended')
    and (select private.is_class_member(p.class_code))
  group by v.poll_id, v.option_id;
$$;

create or replace function public.submit_survey_response(p_survey_id uuid, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null or p_answers is null then
    raise exception 'A signed-in user and answers are required';
  end if;
  if not exists (
    select 1
    from public.surveys survey
    where survey.id = p_survey_id
      and survey.status = 'active'
      and (survey.deadline is null or survey.deadline >= current_date)
      and (select private.is_class_member(survey.class_code))
  ) then
    raise exception 'Survey is not available to this user';
  end if;
  if exists (
    select 1 from public.survey_responses
    where survey_id = p_survey_id and user_id = (select auth.uid())
  ) then
    raise exception 'You have already submitted this survey';
  end if;

  insert into public.survey_responses (survey_id, user_id, answers)
  values (p_survey_id, (select auth.uid()), p_answers);
end;
$$;

-- Index fields used by class-scoped RLS policies and dashboard queries.
create index if not exists profiles_class_code_role_idx on public.profiles (class_code, role);
create index if not exists polls_class_status_created_idx on public.polls (class_code, status, created_at desc);
create index if not exists poll_options_poll_id_idx on public.poll_options (poll_id);
create index if not exists poll_votes_poll_option_idx on public.poll_votes (poll_id, option_id);
create index if not exists surveys_class_status_created_idx on public.surveys (class_code, status, created_at desc);
create index if not exists announcements_class_created_idx on public.announcements (class_code, created_at desc);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_responses enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "Allow authenticated full access on polls" on public.polls;
drop policy if exists "Allow authenticated full access on poll_options" on public.poll_options;
drop policy if exists "Allow authenticated full access on poll_votes" on public.poll_votes;
drop policy if exists "Allow authenticated full access on surveys" on public.surveys;
drop policy if exists "Allow authenticated full access on survey_responses" on public.survey_responses;
drop policy if exists "Enable read access for all users" on public.announcements;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Teachers can update students in their class" on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy profiles_authenticated_read on public.profiles
for select to authenticated using (true);
create policy profiles_own_insert on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_own_update on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
create policy profiles_teacher_student_update on public.profiles
for update to authenticated
using (role = 'student' and (select private.is_teacher_of_class(class_code)))
with check (role = 'student' and (select private.is_teacher_of_class(class_code)));
create policy profiles_admin_update on public.profiles
for update to authenticated
using ((select public.app_role()) = 'admin')
with check ((select public.app_role()) = 'admin');

create policy polls_student_read on public.polls
for select to authenticated
using (status in ('active', 'ended') and (select private.is_class_member(class_code)));
create policy polls_teacher_manage on public.polls
for all to authenticated
using ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()))
with check ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()));

create policy poll_options_student_read on public.poll_options
for select to authenticated
using (exists (select 1 from public.polls p where p.id = poll_id and p.status in ('active', 'ended') and (select private.is_class_member(p.class_code))));
create policy poll_options_teacher_manage on public.poll_options
for all to authenticated
using ((select private.is_teacher_of_poll(poll_id)))
with check ((select private.is_teacher_of_poll(poll_id)));

create policy poll_votes_owner_read on public.poll_votes
for select to authenticated using (user_id = (select auth.uid()));
create policy poll_votes_teacher_read on public.poll_votes
for select to authenticated using ((select private.is_teacher_of_poll(poll_id)));

create policy surveys_student_read on public.surveys
for select to authenticated
using (status in ('active', 'ended') and (select private.is_class_member(class_code)));
create policy surveys_teacher_manage on public.surveys
for all to authenticated
using ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()))
with check ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()));

create policy survey_responses_owner_read on public.survey_responses
for select to authenticated using (user_id = (select auth.uid()));
create policy survey_responses_teacher_read on public.survey_responses
for select to authenticated using ((select private.is_teacher_of_survey(survey_id)));

create policy announcements_class_read on public.announcements
for select to authenticated using ((select private.is_class_member(class_code)));
create policy announcements_teacher_manage on public.announcements
for all to authenticated
using ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()))
with check ((select private.is_teacher_of_class(class_code)) and created_by = (select auth.uid()));

revoke all on function public.join_class_by_code(text) from public, anon;
revoke all on function public.leave_current_class() from public, anon;
revoke all on function public.create_teacher_class(text) from public, anon;
revoke all on function public.teacher_set_student_access(uuid, text, boolean) from public, anon;
revoke all on function public.request_teacher_role() from public, anon;
revoke all on function public.cast_poll_vote(uuid, uuid[]) from public, anon;
revoke all on function public.get_poll_vote_summary(uuid[]) from public, anon;
revoke all on function public.submit_survey_response(uuid, jsonb) from public, anon;
revoke all on function public.update_class_name_by_code(text, text) from public, anon;
revoke all on function public.disband_class_by_code(text) from public, anon;

grant execute on function public.join_class_by_code(text) to authenticated;
grant execute on function public.leave_current_class() to authenticated;
grant execute on function public.create_teacher_class(text) to authenticated;
grant execute on function public.teacher_set_student_access(uuid, text, boolean) to authenticated;
grant execute on function public.request_teacher_role() to authenticated;
grant execute on function public.cast_poll_vote(uuid, uuid[]) to authenticated;
grant execute on function public.get_poll_vote_summary(uuid[]) to authenticated;
grant execute on function public.submit_survey_response(uuid, jsonb) to authenticated;
grant execute on function public.update_class_name_by_code(text, text) to authenticated;
grant execute on function public.disband_class_by_code(text) to authenticated;
