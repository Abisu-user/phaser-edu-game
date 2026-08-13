-- Keep player rewards and friendship state consistent in a single database transaction.

create table if not exists public.daily_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id text not null check (quest_id in ('login', 'pass_levels', 'perfect_clear')),
  reward_date date not null,
  awarded_xp integer not null check (awarded_xp >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, quest_id, reward_date)
);

create table if not exists public.xp_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_key text not null,
  awarded_xp integer not null check (awarded_xp > 0),
  xp_after integer not null,
  total_xp_after integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, source_type, source_key)
);

create index if not exists daily_reward_claims_user_date_idx
  on public.daily_reward_claims (user_id, reward_date);
create index if not exists xp_activity_log_user_created_idx
  on public.xp_activity_log (user_id, created_at desc);

alter table public.daily_reward_claims enable row level security;
alter table public.xp_activity_log enable row level security;

revoke all on table public.daily_reward_claims from anon, authenticated;
revoke all on table public.xp_activity_log from anon, authenticated;

-- This helper is intentionally private: all client-facing reward paths call a
-- purpose-specific RPC which validates eligibility before invoking it.
create or replace function private.apply_xp_reward(
  p_user_id uuid,
  p_source_type text,
  p_source_key text,
  p_awarded_xp integer
)
returns table (current_xp integer, current_level integer, total_xp integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_xp integer;
  v_level integer;
  v_total_xp integer;
  v_stat_points integer;
  v_required_xp integer;
begin
  if p_awarded_xp <= 0 then
    raise exception 'Reward XP must be positive';
  end if;

  perform set_config('app.profile_internal_write', 'on', true);

  select coalesce(xp, 0), greatest(coalesce(level, 1), 1),
         coalesce(total_exp, 0), coalesce(stat_points, 0)
    into v_xp, v_level, v_total_xp, v_stat_points
    from public.profiles
   where id = p_user_id
   for update;

  if not found then
    raise exception 'Player profile was not found';
  end if;

  v_xp := v_xp + p_awarded_xp;
  v_total_xp := v_total_xp + p_awarded_xp;
  v_required_xp := 1000 + ((v_level - 1) * 500);

  while v_xp >= v_required_xp loop
    v_xp := v_xp - v_required_xp;
    v_level := v_level + 1;
    v_stat_points := v_stat_points + 2;
    v_required_xp := 1000 + ((v_level - 1) * 500);
  end loop;

  update public.profiles
     set xp = v_xp,
         level = v_level,
         total_exp = v_total_xp,
         stat_points = v_stat_points
   where id = p_user_id;

  insert into public.xp_activity_log (
    user_id, source_type, source_key, awarded_xp, xp_after, total_xp_after
  ) values (
    p_user_id, p_source_type, p_source_key, p_awarded_xp, v_xp, v_total_xp
  );

  return query select v_xp, v_level, v_total_xp;
end;
$$;

create or replace function public.get_daily_quest_status()
returns table (
  quest_id text,
  target integer,
  progress integer,
  awarded_xp integer,
  is_claimed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Taipei')::date;
  v_day_start timestamptz := v_today::timestamp at time zone 'Asia/Taipei';
  v_day_end timestamptz := (v_today + 1)::timestamp at time zone 'Asia/Taipei';
  v_completed integer;
  v_perfect integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select count(*)::integer into v_completed
    from public.user_progress
   where user_id = v_user_id
     and completed_at >= v_day_start
     and completed_at < v_day_end;

  select count(*)::integer into v_perfect
    from public.user_progress
   where user_id = v_user_id
     and stars >= 3
     and completed_at >= v_day_start
     and completed_at < v_day_end;

  return query
  select q.quest_id, q.target, q.progress, q.awarded_xp,
         exists (
           select 1 from public.daily_reward_claims c
            where c.user_id = v_user_id
              and c.quest_id = q.quest_id
              and c.reward_date = v_today
         )
    from (values
      ('login'::text, 1::integer, 1::integer, 50::integer),
      ('pass_levels'::text, 3::integer, least(v_completed, 3), 300::integer),
      ('perfect_clear'::text, 1::integer, least(v_perfect, 1), 150::integer)
    ) as q(quest_id, target, progress, awarded_xp);
end;
$$;

create or replace function public.claim_daily_quest_reward(p_quest_id text)
returns table (
  awarded_xp integer,
  current_xp integer,
  current_level integer,
  total_xp integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Taipei')::date;
  v_day_start timestamptz := v_today::timestamp at time zone 'Asia/Taipei';
  v_day_end timestamptz := (v_today + 1)::timestamp at time zone 'Asia/Taipei';
  v_target integer;
  v_progress integer;
  v_award integer;
  v_xp integer;
  v_level integer;
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  case p_quest_id
    when 'login' then
      v_target := 1; v_progress := 1; v_award := 50;
    when 'pass_levels' then
      v_target := 3; v_award := 300;
      select least(count(*)::integer, v_target) into v_progress
        from public.user_progress
       where user_id = v_user_id
         and completed_at >= v_day_start
         and completed_at < v_day_end;
    when 'perfect_clear' then
      v_target := 1; v_award := 150;
      select least(count(*)::integer, v_target) into v_progress
        from public.user_progress
       where user_id = v_user_id
         and stars >= 3
         and completed_at >= v_day_start
         and completed_at < v_day_end;
    else
      raise exception 'Unknown daily quest';
  end case;

  if v_progress < v_target then
    raise exception 'Daily quest is not complete';
  end if;

  insert into public.daily_reward_claims (user_id, quest_id, reward_date, awarded_xp)
  values (v_user_id, p_quest_id, v_today, v_award)
  on conflict (user_id, quest_id, reward_date) do nothing;

  if not found then
    raise exception 'Daily reward has already been claimed';
  end if;

  select current_xp, current_level, total_xp
    into v_xp, v_level, v_total
    from private.apply_xp_reward(
      v_user_id, 'daily_quest', v_today::text || ':' || p_quest_id, v_award
    );

  return query select v_award, v_xp, v_level, v_total;
end;
$$;

create or replace function public.send_friend_request(p_friend_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_lock_key text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_friend_id is null or p_friend_id = v_user_id then
    raise exception 'You cannot invite yourself';
  end if;
  if not exists (select 1 from public.profiles where id = p_friend_id) then
    raise exception 'Player was not found';
  end if;

  v_lock_key := least(v_user_id::text, p_friend_id::text) || ':' || greatest(v_user_id::text, p_friend_id::text);
  perform pg_advisory_xact_lock(hashtext(v_lock_key));

  if exists (
    select 1 from public.friendships
     where ((user_id = v_user_id and friend_id = p_friend_id)
         or (user_id = p_friend_id and friend_id = v_user_id))
       and status = 'accepted'
  ) then
    raise exception 'You are already friends';
  end if;
  if exists (
    select 1 from public.friendships
     where user_id = v_user_id and friend_id = p_friend_id and status = 'pending'
  ) then
    return false;
  end if;
  if exists (
    select 1 from public.friendships
     where user_id = p_friend_id and friend_id = v_user_id and status = 'pending'
  ) then
    raise exception 'This player has already invited you';
  end if;

  insert into public.friendships (user_id, friend_id, status)
  values (v_user_id, p_friend_id, 'pending');
  return true;
end;
$$;

create or replace function public.respond_to_friend_request(
  p_sender_id uuid,
  p_accept boolean
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_lock_key text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  v_lock_key := least(v_user_id::text, p_sender_id::text) || ':' || greatest(v_user_id::text, p_sender_id::text);
  perform pg_advisory_xact_lock(hashtext(v_lock_key));

  if p_accept then
    update public.friendships
       set status = 'accepted'
     where user_id = p_sender_id
       and friend_id = v_user_id
       and status = 'pending';
    if not found then
      raise exception 'Friend request was not found';
    end if;

    insert into public.friendships (user_id, friend_id, status)
    values (v_user_id, p_sender_id, 'accepted')
    on conflict (user_id, friend_id)
    do update set status = 'accepted';
  else
    delete from public.friendships
     where user_id = p_sender_id
       and friend_id = v_user_id
       and status = 'pending';
    if not found then
      raise exception 'Friend request was not found';
    end if;
  end if;
  return true;
end;
$$;

-- Poll and survey rewards now use the same locked profile update and activity log.
create or replace function public.claim_poll_reward(p_poll_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward integer;
  v_claimed uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select coalesce((settings->>'expReward')::integer, 0)
    into v_reward from public.polls where id = p_poll_id and status = 'active';
  if coalesce(v_reward, 0) <= 0 then return 0; end if;

  insert into public.xp_reward_claims (user_id, source_type, source_id, awarded_xp)
  values (v_user_id, 'poll', p_poll_id, v_reward)
  on conflict (user_id, source_type, source_id) do nothing
  returning id into v_claimed;
  if v_claimed is null then return 0; end if;

  perform private.apply_xp_reward(v_user_id, 'poll', p_poll_id::text, v_reward);
  return v_reward;
end;
$$;

create or replace function public.claim_survey_reward(p_survey_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward integer;
  v_claimed uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select coalesce((settings->>'expReward')::integer, 0)
    into v_reward from public.surveys where id = p_survey_id and status = 'active';
  if coalesce(v_reward, 0) <= 0 then return 0; end if;

  insert into public.xp_reward_claims (user_id, source_type, source_id, awarded_xp)
  values (v_user_id, 'survey', p_survey_id, v_reward)
  on conflict (user_id, source_type, source_id) do nothing
  returning id into v_claimed;
  if v_claimed is null then return 0; end if;

  perform private.apply_xp_reward(v_user_id, 'survey', p_survey_id::text, v_reward);
  return v_reward;
end;
$$;

revoke all on function private.apply_xp_reward(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.get_daily_quest_status() from public, anon;
revoke all on function public.claim_daily_quest_reward(text) from public, anon;
revoke all on function public.send_friend_request(uuid) from public, anon;
revoke all on function public.respond_to_friend_request(uuid, boolean) from public, anon;
revoke all on function public.claim_poll_reward(uuid) from public, anon;
revoke all on function public.claim_survey_reward(uuid) from public, anon;

grant execute on function public.get_daily_quest_status() to authenticated;
grant execute on function public.claim_daily_quest_reward(text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;
grant execute on function public.claim_poll_reward(uuid) to authenticated;
grant execute on function public.claim_survey_reward(uuid) to authenticated;

-- Friendship creation and acceptance now pass through the validated RPCs above.
revoke insert, update on table public.friendships from authenticated;
