-- 00012_signup_availability.sql
-- Pre-signup availability check (D2 Sign Up Step 3 — duplicate detection).
--
-- Worker reported that creating an account with a phone already on file
-- silently succeeded — Supabase Auth enforces uniqueness on email but not on
-- phone, so a duplicate phone slipped through and the worker only saw an
-- error during a later sign-in. This RPC lets the client check both fields
-- BEFORE calling supabase.auth.signUp so the form can surface inline errors.
--
-- The function is SECURITY DEFINER so anon callers can hit auth.users, which
-- is otherwise locked down. Account-enumeration risk is no greater than
-- supabase.auth.signUp returning "user already registered" today, so this
-- exposes no new information.

create or replace function public.check_signup_availability(
  p_email text default null,
  p_phone text default null
) returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  email_taken boolean := false;
  phone_taken boolean := false;
  normalised_phone text;
begin
  if p_email is not null and length(trim(p_email)) > 0 then
    select exists(
      select 1 from auth.users where lower(email) = lower(trim(p_email))
    ) into email_taken;
  end if;

  if p_phone is not null and length(trim(p_phone)) > 0 then
    -- Strip everything but digits and the leading + so "+1 555 123 4567",
    -- "+15551234567", and "15551234567" all collide.
    normalised_phone := regexp_replace(trim(p_phone), '[^0-9+]', '', 'g');
    select exists(
      select 1 from auth.users
        where regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g') = normalised_phone
      union all
      select 1 from public.users
        where regexp_replace(coalesce(phone_number, ''), '[^0-9+]', '', 'g') = normalised_phone
    ) into phone_taken;
  end if;

  return json_build_object(
    'email_taken', email_taken,
    'phone_taken', phone_taken
  );
end;
$$;

grant execute on function public.check_signup_availability(text, text) to anon, authenticated;

comment on function public.check_signup_availability(text, text) is
  'Returns { email_taken, phone_taken } so the signup form can block duplicates BEFORE calling auth.signUp. SECURITY DEFINER — exposes no info supabase.auth.signUp does not already leak via its own error responses.';
