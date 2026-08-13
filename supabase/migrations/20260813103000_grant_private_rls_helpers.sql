-- RLS expressions execute as the request role. The helpers stay in the
-- non-exposed private schema and retain their auth.uid()-based checks, while
-- authenticated requests receive the minimum access needed to evaluate them.
grant usage on schema private to authenticated;
grant execute on function private.is_class_member(text) to authenticated;
grant execute on function private.is_teacher_of_class(text) to authenticated;
grant execute on function private.is_teacher_of_poll(uuid) to authenticated;
grant execute on function private.is_teacher_of_survey(uuid) to authenticated;
