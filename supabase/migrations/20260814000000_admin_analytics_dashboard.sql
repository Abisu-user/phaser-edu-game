-- Admin-only aggregated analytics. Keep raw user-level learning data out of the browser.

create index if not exists user_progress_completed_at_user_course_level_idx
  on public.user_progress (completed_at desc, user_id, course_id, level_id);

create or replace function public.admin_get_analytics(
  p_start_date date default (current_date - 29),
  p_end_date date default current_date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_start_date date := coalesce(p_start_date, current_date - 29);
  v_end_date date := coalesce(p_end_date, current_date);
begin
  if (select public.app_role()) <> 'admin' then
    raise exception 'Only admins can view analytics';
  end if;

  if v_start_date > v_end_date then
    raise exception 'Start date must be on or before end date';
  end if;

  return (
    with active_students as (
      select id
      from public.profiles
      where role = 'student' and coalesce(status, 'active') = 'active'
    ),
    range_progress as (
      select up.*
      from public.user_progress up
      join active_students students on students.id = up.user_id
      where up.completed_at >= v_start_date
        and up.completed_at < (v_end_date + 1)
    ),
    all_python_progress as (
      select distinct up.user_id, up.level_id
      from public.user_progress up
      join active_students students on students.id = up.user_id
      where up.course_id = 'python' and up.level_id between 1 and 25
    ),
    student_count as (
      select count(*)::integer as value from active_students
    ),
    completion as (
      select case when (select value from student_count) = 0 then 0
        else round(
          100.0 * count(*) / ((select value from student_count) * 25),
          1
        )
      end as value
      from all_python_progress
    ),
    daily_activity as (
      select
        calendar.day,
        count(distinct range_progress.user_id)::integer as active_users,
        count(*)::integer as completions
      from generate_series(v_start_date, v_end_date, interval '1 day') as calendar(day)
      left join range_progress
        on range_progress.completed_at >= calendar.day
       and range_progress.completed_at < calendar.day + interval '1 day'
      group by calendar.day
      order by calendar.day
    ),
    blockers as (
      select
        series.level_id,
        count(progress.user_id)::integer as completed_users,
        greatest((select value from student_count) - count(progress.user_id), 0)::integer as stuck_users,
        case when (select value from student_count) = 0 then 0
          else round(100.0 * count(progress.user_id) / (select value from student_count), 1)
        end as completion_rate
      from generate_series(1, 25) as series(level_id)
      left join all_python_progress progress on progress.level_id = series.level_id
      group by series.level_id
      order by stuck_users desc, series.level_id asc
      limit 5
    )
    select jsonb_build_object(
      'summary', jsonb_build_object(
        'dau', (select active_users from daily_activity where day::date = v_end_date),
        'total_users', (select count(*)::integer from public.profiles where coalesce(status, 'active') = 'active'),
        'active_students', (select count(distinct user_id)::integer from range_progress),
        'active_courses', (select count(distinct course_id)::integer from range_progress where course_id is not null),
        'active_levels', (select count(distinct (course_id, level_id))::integer from range_progress),
        'completion_rate', (select value from completion),
        'student_count', (select value from student_count)
      ),
      'daily_activity', coalesce((
        select jsonb_agg(jsonb_build_object(
          'date', to_char(day, 'YYYY-MM-DD'),
          'active_users', active_users,
          'completions', completions
        ) order by day)
        from daily_activity
      ), '[]'::jsonb),
      'blockers', coalesce((
        select jsonb_agg(jsonb_build_object(
          'level_id', level_id,
          'title', format('基礎邏輯 %s', level_id),
          'completed_users', completed_users,
          'stuck_users', stuck_users,
          'completion_rate', completion_rate
        ) order by stuck_users desc, level_id asc)
        from blockers
      ), '[]'::jsonb),
      'period', jsonb_build_object('start_date', v_start_date, 'end_date', v_end_date)
    )
  );
end;
$$;

revoke all on function public.admin_get_analytics(date, date) from public, anon;
grant execute on function public.admin_get_analytics(date, date) to authenticated;
