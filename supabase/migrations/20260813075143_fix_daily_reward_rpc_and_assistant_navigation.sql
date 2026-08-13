-- Fix PL/pgSQL output-column ambiguity in the daily reward transaction.
-- The claim row, profile update and activity row remain in one RPC transaction.

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

  select coalesce(p.xp, 0), greatest(coalesce(p.level, 1), 1),
         coalesce(p.total_exp, 0), coalesce(p.stat_points, 0)
    into v_xp, v_level, v_total_xp, v_stat_points
    from public.profiles as p
   where p.id = p_user_id
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

  update public.profiles as p
     set xp = v_xp,
         level = v_level,
         total_exp = v_total_xp,
         stat_points = v_stat_points
   where p.id = p_user_id;

  insert into public.xp_activity_log (
    user_id, source_type, source_key, awarded_xp, xp_after, total_xp_after
  ) values (
    p_user_id, p_source_type, p_source_key, p_awarded_xp, v_xp, v_total_xp
  );

  return query
  select v_xp as current_xp,
         v_level as current_level,
         v_total_xp as total_xp;
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
        from public.user_progress as up
       where up.user_id = v_user_id
         and up.completed_at >= v_day_start
         and up.completed_at < v_day_end;
    when 'perfect_clear' then
      v_target := 1; v_award := 150;
      select least(count(*)::integer, v_target) into v_progress
        from public.user_progress as up
       where up.user_id = v_user_id
         and up.stars >= 3
         and up.completed_at >= v_day_start
         and up.completed_at < v_day_end;
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

  select reward.current_xp, reward.current_level, reward.total_xp
    into v_xp, v_level, v_total
    from private.apply_xp_reward(
      v_user_id, 'daily_quest', v_today::text || ':' || p_quest_id, v_award
    ) as reward;

  return query
  select v_award as awarded_xp,
         v_xp as current_xp,
         v_level as current_level,
         v_total as total_xp;
end;
$$;

revoke all on function private.apply_xp_reward(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.claim_daily_quest_reward(text) from public, anon;
grant execute on function public.claim_daily_quest_reward(text) to authenticated;
