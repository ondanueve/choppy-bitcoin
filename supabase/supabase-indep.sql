alter table public.profiles add column if not exists indep_s double precision;
alter table public.profiles add column if not exists indep_at timestamptz;

create or replace function public.submit_independence(
  p_life double precision,
  p_candles integer
)
returns double precision
language plpgsql
security definer
set search_path = public
as '
declare
  uid uuid := auth.uid();
  v_prev double precision;
begin
  if uid is null then
    raise exception ''not signed in'';
  end if;
  if p_life is null or p_life < 12 or p_life > 86400 then
    raise exception ''bad time'';
  end if;
  if p_candles is null or p_candles < 3 then
    raise exception ''few candles'';
  end if;
  if p_candles > (p_life * 5 + 8) then
    raise exception ''candle rate'';
  end if;

  select indep_s into v_prev from public.profiles where id = uid;
  if not found then
    raise exception ''no profile'';
  end if;
  if v_prev is not null and p_life >= v_prev then
    return v_prev;
  end if;

  update public.profiles
     set indep_s = p_life,
         indep_at = now()
   where id = uid;

  return p_life;
end;
';

revoke all on function public.submit_independence(double precision, integer) from public;
grant execute on function public.submit_independence(double precision, integer) to authenticated;
