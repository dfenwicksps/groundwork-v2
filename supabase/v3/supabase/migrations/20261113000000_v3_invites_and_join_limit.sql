-- Groundwork v3, Phase 1c: what sign-in and class codes need that the first
-- migration didn't have.
--
--   1. staff_invites: a school admin (or the platform admin) invites a teacher
--      by email. The schema had no way to add staff without already knowing
--      their user id, and nobody can look a user up by email (V-S1).
--   2. join_class() now limits wrong guesses, as the first migration said
--      Phase 1 must.
--
-- Rules are in docs/v3/visibility.md (V-A9, V-A10, V-S12).

-- ============================================================================
-- 1. STAFF INVITES
-- ============================================================================

-- The only email addresses the schema holds, and only for adults invited to
-- be staff. The row is deleted when the invite is taken up, so an address
-- isn't kept once the person has an account.
create table public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+$'),
  role text not null check (role in ('school_admin', 'teacher')),
  invited_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, email)
);

-- V-A9: a school admin sees and manages invites for their own school only;
-- the platform admin for any school (that's how a school gets its first
-- admin, V-P4). Teachers and students see none.
alter table public.staff_invites enable row level security;
create policy "staff invites: admin reads own school" on public.staff_invites
  for select to authenticated
  using (public.is_school_admin(school_id) or public.is_platform_admin());
create policy "staff invites: admin invites to own school" on public.staff_invites
  for insert to authenticated
  with check (
    (public.is_school_admin(school_id) or public.is_platform_admin())
    and invited_by = auth.uid()
  );
create policy "staff invites: admin withdraws" on public.staff_invites
  for delete to authenticated
  using (public.is_school_admin(school_id) or public.is_platform_admin());

revoke all on public.staff_invites from anon;
revoke update on public.staff_invites from authenticated;

-- V-A10: the signed-in person takes up any invites sent to their own,
-- CONFIRMED, email address. An unconfirmed address proves nothing: anyone can
-- type someone else's email into a sign-up form. Returns how many schools
-- they were added to. Called by the app after every sign-in; harmless when
-- there's nothing waiting.
create function public.accept_staff_invites()
returns int language plpgsql security definer set search_path = public
as $$
declare
  v_email text;
  n int;
begin
  if auth.uid() is null then return 0; end if;
  select lower(btrim(u.email)) into v_email
    from auth.users u
   where u.id = auth.uid() and u.email_confirmed_at is not null;
  if v_email is null then return 0; end if;

  insert into staff (user_id, school_id, role)
  select auth.uid(), i.school_id, i.role
    from staff_invites i
   where i.email = v_email
  on conflict (user_id, school_id) do nothing;
  get diagnostics n = row_count;

  delete from staff_invites where email = v_email;
  return n;
end;
$$;

-- V-A4: a school admin needs their staff's names to assign a teacher to a
-- class, and can't read public.users (V-S1 applies to everyone). Names and
-- roles of the staff of one school, for that school's admin or the platform
-- admin; nothing for anyone else, and never a student.
create function public.school_staff(p_school uuid)
returns table (user_id uuid, display_name text, role text, added_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select s.user_id, u.display_name, s.role, s.added_at
    from staff s join users u on u.id = s.user_id
   where s.school_id = p_school
     and (public.is_school_admin(p_school) or public.is_platform_admin())
   order by u.display_name
$$;


-- ============================================================================
-- 2. A LIMIT ON CLASS-CODE GUESSES
-- ============================================================================

-- One row per wrong guess. No code is stored, only who and when. Nobody reads
-- this table from the app: row security is on and there is no policy.
create table public.join_attempts (
  user_id uuid not null references public.users(id) on delete cascade,
  tried_at timestamptz not null default now()
);
create index join_attempts_user_idx on public.join_attempts (user_id, tried_at);
alter table public.join_attempts enable row level security;
revoke all on public.join_attempts from anon, authenticated;

-- How many wrong guesses in how long.
create function public.join_attempt_limit()
returns int language sql immutable as $$ select 8 $$;

-- V-S6 as before. V-S12: after join_attempt_limit() wrong codes in ten
-- minutes, every code is refused until the ten minutes pass, right or wrong,
-- so the answer doesn't say whether a code exists.
create or replace function public.join_class(p_code text)
returns table (class_id uuid, class_name text, year_level smallint, teacher_name text)
language plpgsql security definer set search_path = public
as $$
declare
  c classes%rowtype;
  recent int;
begin
  if auth.uid() is null then return; end if;

  delete from join_attempts
   where user_id = auth.uid() and tried_at < now() - interval '10 minutes';
  select count(*) into recent from join_attempts where user_id = auth.uid();
  if recent >= public.join_attempt_limit() then return; end if;

  select * into c from classes
   where join_code = upper(btrim(p_code)) and archived_at is null;
  if not found then
    insert into join_attempts (user_id) values (auth.uid());
    return;
  end if;

  insert into class_members (class_id, student_id) values (c.id, auth.uid())
  on conflict do nothing;
  -- Fires users_year_level(), which copies the class's year level.
  update users set year_level = c.year_level where id = auth.uid();

  return query
    select c.id, c.name, c.year_level, t.display_name
      from (select 1) one left join users t on t.id = c.teacher_id;
end;
$$;


-- ============================================================================
-- 3. WHO MAY CALL WHAT
-- ============================================================================

revoke all on function public.accept_staff_invites() from public, anon;
revoke all on function public.school_staff(uuid) from public, anon;
revoke all on function public.join_attempt_limit() from public, anon;
revoke all on function public.join_class(text) from public, anon;
grant execute on function
  public.accept_staff_invites(),
  public.school_staff(uuid),
  public.join_attempt_limit(),
  public.join_class(text)
to authenticated;
