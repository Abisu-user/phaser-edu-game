-- A teacher's publishing authority must be derived from the protected profile
-- record, not a potentially stale JWT role claim. This keeps RLS consistent
-- immediately after an administrator changes a user's role or class assignment.
create or replace function private.is_teacher_of_class(p_class_code text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null
     and exists (
       select 1
       from public.profiles as p
       where p.id = (select auth.uid())
         and p.class_code = p_class_code
         and p.role = 'teacher'
         and p.status = 'active'
     );
$$;

-- Recreate the policies explicitly so inserts, updates and deletes all use the
-- same class-owner rule. `created_by` prevents one teacher editing another's work.
drop policy if exists polls_teacher_manage on public.polls;
create policy polls_teacher_manage on public.polls
for all to authenticated
using (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
)
with check (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
);

drop policy if exists surveys_teacher_manage on public.surveys;
create policy surveys_teacher_manage on public.surveys
for all to authenticated
using (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
)
with check (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
);

drop policy if exists announcements_teacher_manage on public.announcements;
create policy announcements_teacher_manage on public.announcements
for all to authenticated
using (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
)
with check (
  (select private.is_teacher_of_class(class_code))
  and created_by = (select auth.uid())
);
