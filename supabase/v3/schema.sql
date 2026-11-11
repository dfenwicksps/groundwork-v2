-- ============================================================================
-- GROUNDWORK v3: database schema  (DRAFT, Phase 0)
-- ============================================================================
--
-- NOT APPLIED ANYWHERE. Don't run this against the live Supabase project.
-- v2 still runs on supabase/schema.sql and supabase/migrations/, which this
-- file leaves alone. It becomes the v3 baseline in Phase 1, after review.
--
-- What it is: one clean schema that replaces v2's schema.sql plus its 20
-- migration files (v2 has no students and no data to keep), and adds schools,
-- classes, content, media and class-level reporting.
--
-- Every policy and function is commented with the rule it implements from
-- docs/v3/visibility.md (V-S1, V-T1 and so on). The shape of the whole thing:
--
--   * A student reads and writes their own rows, and nobody else's.
--   * Staff have NO policy on any student-owned table. With row security on
--     and no policy, a teacher's query returns nothing.
--   * Everything staff learn about students comes from three functions:
--     class_roster(), class_patterns() and shared_with_me().
--   * class_patterns() hides small groups inside the database, so the true
--     figure never reaches a browser.
--
-- Checked in Phase 0 only by scripts/v3/check-schema.mjs, which loads it into
-- an in-memory Postgres (PGlite) with Supabase's auth schema, roles and
-- default grants stubbed, and runs the visibility rules against it. That
-- shows it parses and that the rules hold there; it does not prove they hold
-- on real Supabase. Phase 1's access tests, on a local Supabase, do that.
-- ============================================================================


-- ============================================================================
-- 1. PEOPLE AND TENANCY
-- ============================================================================

-- One row per signed-in person, student or staff (mirrors auth.users).
-- Carried over from v2 with one addition: year_level.
-- No date of birth, phone number, address or location, here or anywhere (V-C2).
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  onboarding_complete boolean not null default false,
  active_mission int not null default 1,
  -- v2's copy variants: 'junior' (Year 7-9), 'middle' (10-11), 'senior' (12),
  -- 'leaver', 'adult'. Still drives wording. It does NOT drive media ratings.
  life_stage text check (life_stage is null or life_stage in ('junior', 'middle', 'senior', 'leaver', 'adult')),
  -- NEW. The only age signal (D8). Copied from the class when a student joins
  -- (V-C3); a student with no class picks a year group. See users_year_level().
  year_level smallint check (year_level is null or year_level between 7 and 12),
  theme text check (theme is null or theme in ('light', 'dark', 'bold', 'neon')),
  ai_reflections_enabled boolean not null default true,
  -- v2's three-phase journey. Kept so nothing is lost; whether v3 keeps the
  -- feature is an open question (docs/v3/navigation.md, section 8).
  journey_phase int not null default 1,
  phase_meta jsonb
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Australian state or territory, e.g. 'QLD'. Decides the senior-planning
  -- wording and the admissions-centre link.
  state text not null check (state in ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA')),
  -- Film policy for lesson mode; which ratings are enabled per age band;
  -- library catalogue address; senior-planning name and date; ai_enabled;
  -- the "Who to talk to here" card. Read by src/lib/v3/ageBands.ts, which
  -- ignores any rating setting above the band's maximum (V-A7).
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Kept apart from staff, as the spec asks: a platform admin isn't a member of
-- any school.
create table public.platform_admins (
  user_id uuid primary key references public.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

create table public.staff (
  user_id uuid not null references public.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  role text not null check (role in ('school_admin', 'teacher')),
  added_at timestamptz not null default now(),
  primary key (user_id, school_id)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  -- Null when the teacher's account has been deleted; a school admin reassigns.
  teacher_id uuid references public.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 60),
  year_level smallint not null check (year_level between 7 and 12),
  -- Six characters from an alphabet with no 0/O, 1/I/L. See new_join_code().
  join_code text not null unique check (join_code ~ '^[A-HJKMNP-Z2-9]{6}$'),
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index classes_school_idx on public.classes (school_id);
create index classes_teacher_idx on public.classes (teacher_id);

-- A student can be in more than one class.
create table public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index class_members_student_idx on public.class_members (student_id);


-- ============================================================================
-- 2. HELPERS
-- ============================================================================
-- All "security definer" with a fixed search_path, so a policy can ask "is
-- this person a teacher of that class?" without the policy itself needing to
-- read tables the caller can't.

-- The minimum group. MUST equal SMALL_COUNT in src/lib/completionCounts.ts;
-- SQL can't import it, so a Phase 1 test asserts the two match (V-K1). No
-- other literal 5 appears in this file.
create function public.small_count()
returns int language sql immutable
as $$ select 5 $$;

create function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from platform_admins where user_id = auth.uid()) $$;

create function public.is_school_admin(p_school uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from staff
    where user_id = auth.uid() and school_id = p_school and role = 'school_admin'
  )
$$;

create function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from staff where user_id = auth.uid()) $$;

create function public.teaches(p_class uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from classes
    where id = p_class and teacher_id = auth.uid() and archived_at is null
  )
$$;

-- The class's own teacher, or an admin of the class's school. Not a teacher
-- of another class in the same school (V-T6), and not a platform admin (V-P2).
create function public.can_report_on(p_class uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from classes c
    where c.id = p_class
      and (
        (c.teacher_id = auth.uid() and c.archived_at is null)
        or exists (
          select 1 from staff s
          where s.user_id = auth.uid() and s.school_id = c.school_id and s.role = 'school_admin'
        )
      )
  )
$$;

-- Every school the caller belongs to, as a student (through a class) or as staff.
create function public.my_school_ids()
returns setof uuid language sql stable security definer set search_path = public
as $$
  select c.school_id from class_members m join classes c on c.id = m.class_id
   where m.student_id = auth.uid()
  union
  select school_id from staff where user_id = auth.uid()
$$;

create function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- A new six-character class code. 31 letters and digits, about 887 million
-- codes. Phase 1 must rate-limit join_class() so codes can't be guessed by
-- trying them.
create function public.new_join_code()
returns text language plpgsql volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea;
  code text;
  i int;
begin
  loop
    bytes := uuid_send(gen_random_uuid());
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, 1 + (get_byte(bytes, i) % length(alphabet)), 1);
    end loop;
    exit when not exists (select 1 from public.classes where join_code = code);
  end loop;
  return code;
end;
$$;

alter table public.classes alter column join_code set default public.new_join_code();

-- A student in a class has the class's year level, whatever they send; in
-- more than one class, the lowest, so media is filtered to the youngest band
-- they're taught in. Only a student with no class sets their own (V-C3).
create function public.users_year_level()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  from_class smallint;
begin
  select min(c.year_level) into from_class
    from class_members m join classes c on c.id = m.class_id
   where m.student_id = new.id;
  if from_class is not null then
    new.year_level := from_class;
  end if;
  return new;
end;
$$;

create trigger users_year_level
  before insert or update on public.users
  for each row execute function public.users_year_level();

-- v2's trigger, unchanged: a profile row for every new sign-in.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 3. STUDENT-OWNED TABLES CARRIED OVER FROM v2
-- ============================================================================
-- Columns are v2's (schema.sql plus migrations 002-021), unchanged.
--
-- There is no school_id on any of these (D29, replacing D16). The spec asks
-- for one, but no staff role can read these tables, so no policy would use
-- it, and a copy goes stale when a student changes class. A student's school
-- is always worked out from class_members -> classes.school_id. Removing a
-- school's students' data therefore goes through its class lists.

create table public.onboarding_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  why_here text,
  strengths text[],
  values text[],
  completed_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id int not null,
  activity_id text not null,
  -- NEW. The content item and version the student answered, so a revisit
  -- shows the wording they actually saw. Null for entries with no content item.
  item_key text,
  item_version int,
  prompt text not null,
  response text not null default '',
  ai_reflection text,
  is_milestone boolean not null default false,
  revisit_of uuid references public.journal_entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);
create index journal_entries_revisit_of_idx on public.journal_entries (revisit_of, created_at);

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id int not null,
  challenge_text text not null,
  issued_at timestamptz not null default now(),
  completed_at timestamptz,
  debrief_response text
);

create table public.support_circle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  relationship text not null,
  added_at timestamptz not null default now()
);

create table public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id int not null,
  activity_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, mission_id, activity_id)
);

-- v2's eight seeded stories. Not student-owned: readable by anyone signed in.
-- Phase 1 moves these into content_items (kind = 'story'); the table stays
-- until then so story_reads keeps its foreign key.
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  mission_id int not null,
  title text not null,
  teaser text not null,
  context text not null,
  turning_point text not null,
  reflection_prompts text[] not null,
  tags text[] not null default '{}'
);

create table public.story_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  opened_at timestamptz,
  read_at timestamptz,
  actioned_at timestamptz,
  unique (user_id, story_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  domain text not null check (domain in ('school', 'life', 'future')),
  wish text not null,
  outcome text,
  obstacle text,
  plan text,
  linked_value text,
  linked_strength text,
  status text not null default 'active' check (status in ('active', 'done', 'archived')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  reflection text
);

create table public.practice_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  strength_key text not null,
  action text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  reflection text
);

create table public.moral_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  style_scores jsonb not null,
  primary_style text not null,
  secondary_style text,
  answers jsonb,
  taken_at timestamptz not null default now()
);

create table public.standard_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  set text not null default 'standard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index standard_checkins_user_set_created_idx
  on public.standard_checkins (user_id, set, created_at desc);

create table public.program_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week int not null check (week between 1 and 10),
  days jsonb not null default '[]'::jsonb,
  commitment text,
  reflection text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, week)
);

create table public.strength_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  scores jsonb not null,
  ranking text[] not null,
  answers jsonb,
  taken_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The evaluation check-in (src/lib/checkin.ts). Not the self-check.
create table public.outcome_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wave text not null check (wave in ('start', 'end')),
  item_set text not null,
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  life_stage text,
  context text check (context is null or context in ('onboarding', 'home')),
  dose jsonb,
  created_at timestamptz not null default now()
);

create index outcome_checkins_user_created_idx
  on public.outcome_checkins (user_id, created_at desc);

create table public.small_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_id uuid references public.journal_entries(id) on delete cascade,
  source_kind text not null check (source_kind in ('activity', 'week', 'weekly', 'next')),
  source_key text not null,
  source_label text,
  step text not null,
  when_label text,
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'done', 'dropped')),
  snoozes int not null default 0,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint small_steps_entry_unique unique (entry_id)
);

create index small_steps_user_due_idx on public.small_steps (user_id, status, due_at);

create table public.conversation_requests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id int not null,
  activity_id text not null,
  from_name text not null check (char_length(from_name) between 1 and 40),
  for_label text not null check (char_length(for_label) between 1 and 40),
  questions jsonb not null check (jsonb_typeof(questions) = 'array'),
  answers jsonb,
  responder_name text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  answered_at timestamptz,
  seen_at timestamptz
);

create index conversation_requests_user_activity_idx
  on public.conversation_requests (user_id, activity_id, created_at desc);


-- ============================================================================
-- 4. NEW STUDENT-OWNED TABLES
-- ============================================================================

-- The self-check (spec section 6). Only the student ever reads a row (V-T2).
create table public.self_checks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  taken_at timestamptz not null default now(),
  -- Which wording was answered, so a revised item set is never compared
  -- item-for-item with an old one.
  item_set text not null,
  -- { "<item key>": 1..5 }
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  -- { "steady": [level ids], "levels": [level ids to explore], "selves": [self keys] }
  -- Words are built from this on the student's screen. No score is stored
  -- for display, and none is ever shown.
  suggested jsonb not null check (
    jsonb_typeof(suggested) = 'object'
    and jsonb_typeof(suggested -> 'levels') = 'array'
  )
);

create index self_checks_student_taken_idx on public.self_checks (student_id, taken_at desc);

-- Which selves a student has opened ("explored"), and the living-it
-- challenges they've accepted. Not in spec section 10's table: added because
-- the "explored" mark and the class-focus counts both need somewhere to live.
create table public.self_progress (
  student_id uuid not null references public.users(id) on delete cascade,
  self_key text not null,
  opened_at timestamptz not null default now(),
  challenge_accepted_at timestamptz,
  challenge_done_at timestamptz,
  primary key (student_id, self_key)
);

-- "Share with my teacher". A COPY of one entry, made by the student, for one
-- teacher (V-SH3, D20). The teacher is never given the journal_entries row.
create table public.shared_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  teacher_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  -- If the student deletes the entry, the copy goes with it.
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  prompt text not null,
  response text not null,
  shared_at timestamptz not null default now(),
  unique (entry_id, teacher_id)
);

create index shared_items_teacher_idx on public.shared_items (teacher_id, shared_at desc);


-- ============================================================================
-- 5. ROW SECURITY ON STUDENT-OWNED TABLES
-- ============================================================================

-- V-S1, V-S2: a student manages their own rows and sees nobody else's.
-- V-T1, V-T3, V-T4, V-A1, V-P1: there is deliberately no policy for any staff
--   or admin role on any of these tables. Row security with no matching
--   policy returns no rows, so a teacher's select on journal_entries is empty.
-- V-S8: these tables have no school_id column (D29). A student's school is
--   always worked out from class_members.
do $$
declare
  t text;
begin
  foreach t in array array[
    'onboarding_results', 'journal_entries', 'challenges', 'support_circle',
    'mission_progress', 'story_reads', 'goals', 'practice_log', 'moral_profiles',
    'standard_checkins', 'program_progress', 'strength_profiles',
    'outcome_checkins', 'small_steps', 'conversation_requests'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "student: own rows only" on public.%I for all to authenticated '
      || 'using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end;
$$;

-- V-S1, V-S2, V-T2: self-check answers and results. The student only.
alter table public.self_checks enable row level security;
create policy "student: own self-checks only" on public.self_checks
  for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- V-S1, V-S2, V-T3: explored marks and accepted challenges. The student only.
-- Staff see these only as counts, through class_patterns().
alter table public.self_progress enable row level security;
create policy "student: own self progress only" on public.self_progress
  for all to authenticated
  using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- V-SH1: no insert policy. A share is created only by share_entry().
-- V-SH5: the student can read what they've shared and take it back.
-- V-SH6, V-A2: no policy for teachers or admins. The one teacher it was sent
--   to reads it through shared_with_me().
alter table public.shared_items enable row level security;
create policy "student: read own shared items" on public.shared_items
  for select to authenticated using (auth.uid() = student_id);
create policy "student: unshare" on public.shared_items
  for delete to authenticated using (auth.uid() = student_id);

-- V-S1, V-T3, V-A1, V-P1: everyone, in any role, reads and updates their own
-- profile row and no other. A teacher learns a student's name from
-- class_roster(), never from this table.
alter table public.users enable row level security;
create policy "own profile: read" on public.users
  for select to authenticated using (auth.uid() = id);
create policy "own profile: update" on public.users
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile: insert" on public.users
  for insert to authenticated with check (auth.uid() = id);

-- v2's rule, unchanged: the seeded stories are readable by anyone signed in.
alter table public.stories enable row level security;
create policy "stories: readable when signed in" on public.stories
  for select to authenticated using (true);


-- ============================================================================
-- 6. ROW SECURITY ON TENANCY
-- ============================================================================

-- V-X1: a school is visible to its own students and staff, and to the
--   platform admin. V-A5: a school admin updates their own school only.
-- V-P4: only the platform admin creates or removes a school.
alter table public.schools enable row level security;
create policy "schools: members read their own" on public.schools
  for select to authenticated
  using (id in (select public.my_school_ids()) or public.is_platform_admin());
create policy "schools: admin updates their own" on public.schools
  for update to authenticated
  using (public.is_school_admin(id) or public.is_platform_admin())
  with check (public.is_school_admin(id) or public.is_platform_admin());
create policy "schools: platform admin creates" on public.schools
  for insert to authenticated with check (public.is_platform_admin());
create policy "schools: platform admin removes" on public.schools
  for delete to authenticated using (public.is_platform_admin());

-- V-P1: a platform admin can confirm their own role. Nobody grants the role
-- from the app (V-A8): rows are added by hand, with the service role.
alter table public.platform_admins enable row level security;
create policy "platform admins: read own row" on public.platform_admins
  for select to authenticated using (auth.uid() = user_id);

-- V-A4, V-A8: a school admin manages staff of their own school and no other.
-- A teacher reads only their own staff rows.
alter table public.staff enable row level security;
create policy "staff: read own, or admin reads school" on public.staff
  for select to authenticated
  using (auth.uid() = user_id or public.is_school_admin(school_id) or public.is_platform_admin());
create policy "staff: admin adds to own school" on public.staff
  for insert to authenticated
  with check (public.is_school_admin(school_id) or public.is_platform_admin());
create policy "staff: admin changes own school" on public.staff
  for update to authenticated
  using (public.is_school_admin(school_id) or public.is_platform_admin())
  with check (public.is_school_admin(school_id) or public.is_platform_admin());
create policy "staff: admin removes from own school" on public.staff
  for delete to authenticated
  using (public.is_school_admin(school_id) or public.is_platform_admin());

-- V-T11: a teacher reads the classes they teach. V-A4: a school admin reads
--   and manages their school's classes.
-- V-S5: there is NO student policy here, because the row holds the join code.
--   A student reads their classes through my_classes().
-- V-P2: the platform admin has no policy here either.
alter table public.classes enable row level security;
create policy "classes: teacher or school admin reads" on public.classes
  for select to authenticated
  using (teacher_id = auth.uid() or public.is_school_admin(school_id));
create policy "classes: school admin creates" on public.classes
  for insert to authenticated with check (public.is_school_admin(school_id));
create policy "classes: school admin changes" on public.classes
  for update to authenticated
  using (public.is_school_admin(school_id)) with check (public.is_school_admin(school_id));
create policy "classes: school admin removes" on public.classes
  for delete to authenticated using (public.is_school_admin(school_id));

-- V-S3: a student reads their own memberships, and can't list classmates.
-- V-S6: no insert policy. Joining happens only through join_class().
-- V-S7: a student can leave.
-- V-T3, V-P2: no staff or platform policy. The roster comes from class_roster().
alter table public.class_members enable row level security;
create policy "class members: read own" on public.class_members
  for select to authenticated using (auth.uid() = student_id);
create policy "class members: leave" on public.class_members
  for delete to authenticated using (auth.uid() = student_id);

-- V-SH9: leaving a class takes back what was shared with its teacher.
create function public.unshare_on_leave()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  delete from shared_items where student_id = old.student_id and class_id = old.class_id;
  return old;
end;
$$;

create trigger unshare_on_leave
  after delete on public.class_members
  for each row execute function public.unshare_on_leave();

-- V-SH9: when a class changes teacher, items shared with the old one go.
create function public.unshare_on_teacher_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if old.teacher_id is distinct from new.teacher_id then
    delete from shared_items where class_id = old.id and teacher_id = old.teacher_id;
  end if;
  return new;
end;
$$;

create trigger unshare_on_teacher_change
  after update on public.classes
  for each row execute function public.unshare_on_teacher_change();


-- ============================================================================
-- 7. CONTENT
-- ============================================================================

-- Central content, published from the repo by the import script. A key never
-- changes; new wording is a new version. Body shapes: src/lib/v3/content.ts.
create table public.content_items (
  kind text not null check (kind in ('self', 'strength', 'activity', 'story', 'cluster', 'subject')),
  key text not null check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  version int not null check (version >= 1),
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  body jsonb not null check (jsonb_typeof(body) = 'object'),
  -- Teacher notes for a self (SelfTeacherNotes). Apart from `body` so that a
  -- student session can be denied the column outright (V-C1).
  teacher_body jsonb,
  published_at timestamptz,
  primary key (kind, key, version)
);

-- One published version of each item at a time.
create unique index content_items_one_published
  on public.content_items (kind, key) where status = 'published';

-- V-S9: anyone signed in reads published central content.
-- V-P4: only the platform admin (or the import script's service role) writes it.
alter table public.content_items enable row level security;
create policy "content: published is readable" on public.content_items
  for select to authenticated
  using (status = 'published' or public.is_platform_admin());
create policy "content: platform admin writes" on public.content_items
  for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- V-C1, V-S9: no signed-in role can select teacher_body from the table. The
-- column grant below leaves it out, so `select *` fails and a query naming the
-- column is refused. Staff read notes through teacher_notes().
revoke all on public.content_items from anon, authenticated;
grant select (kind, key, version, status, body, published_at) on public.content_items to authenticated;
grant insert, update, delete on public.content_items to authenticated;

-- V-T13: staff, and only staff, read the teacher notes for a self.
create function public.teacher_notes(p_self_key text)
returns jsonb language sql stable security definer set search_path = public
as $$
  select ci.teacher_body
    from content_items ci
   where ci.kind = 'self' and ci.key = p_self_key and ci.status = 'published'
     and (public.is_staff() or public.is_platform_admin())
$$;

-- A school's layer over central content.
create table public.content_overrides (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  kind text not null check (kind in ('self', 'strength', 'activity', 'story', 'cluster', 'subject')),
  item_key text not null,
  op text not null check (op in ('hide', 'patch', 'add')),
  body jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, kind, item_key, op),
  -- hide carries nothing.
  constraint override_hide_has_no_body check (op <> 'hide' or body is null),
  -- V-A6: a patch may change localLink on a self and nothing else. A school
  -- can't edit what, notThis, story or sources: the keys aren't accepted.
  constraint override_patch_is_local_link_only check (
    op <> 'patch'
    or (kind = 'self' and jsonb_typeof(body) = 'object' and body ? 'localLink' and (body - 'localLink') = '{}'::jsonb)
  ),
  -- A school adds its own stories and subjects, not selves or strengths.
  constraint override_add_kinds check (
    op <> 'add' or (kind in ('story', 'subject') and jsonb_typeof(body) = 'object')
  )
);

-- V-X2: a school's overrides are visible to that school only.
-- V-A4: its school admins write them. Teachers read but don't write (V-T13).
alter table public.content_overrides enable row level security;
create policy "overrides: own school reads" on public.content_overrides
  for select to authenticated using (school_id in (select public.my_school_ids()));
create policy "overrides: school admin writes" on public.content_overrides
  for all to authenticated
  using (public.is_school_admin(school_id)) with check (public.is_school_admin(school_id));


-- ============================================================================
-- 8. MEDIA
-- ============================================================================

-- One curated record (spec section 8). There is no address column: an embed
-- is always built in code from provider + embed_id on youtube-nocookie.com,
-- so a record can't carry a link to anywhere else. Only a person creates a
-- row; nothing generates or completes an embed_id.
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  -- Null for a central record; set for a school's own (V-X2).
  school_id uuid references public.schools(id) on delete cascade,
  type text not null check (type in ('video', 'song', 'book', 'film')),
  title text not null,
  creator text not null,
  -- For a video: the channel, which must be the rights holder's or official.
  provider text not null,
  embed_id text,
  start_s int check (start_s is null or start_s >= 0),
  end_s int,
  rating text not null check (rating in ('G', 'PG', 'M', 'MA15+')),
  rating_descriptors text[] not null default '{}'
    check (rating_descriptors <@ array['themes', 'violence', 'language', 'drug use', 'nudity', 'sex']),
  -- For a clip from a film or show: the whole title's rating. A G clip can
  -- come from an MA15+ film, and the full film is never suggested above the
  -- student's ceiling.
  source_title_rating text check (source_title_rating is null or source_title_rating in ('G', 'PG', 'M', 'MA15+')),
  min_year_level smallint not null check (min_year_level between 7 and 12),
  why text not null,
  model text not null check (model in ('coping', 'mastery')),
  captions boolean not null default false,
  transcript text,
  verified_at date not null,
  verified_by text not null,
  status text not null default 'active' check (status in ('active', 'broken', 'retired')),
  created_at timestamptz not null default now(),
  -- An embedded clip has an ID, a start and an end, and captions.
  constraint video_is_fully_specified check (
    type <> 'video'
    or (embed_id is not null and start_s is not null and end_s is not null and end_s > start_s and captions)
  ),
  -- A video needs something to read as well.
  constraint video_has_transcript check (type <> 'video' or transcript is not null)
);

-- Links are to a key, so the content version can change underneath.
create table public.media_links (
  media_id uuid not null references public.media_items(id) on delete cascade,
  target_kind text not null check (target_kind in ('self', 'strength')),
  target_key text not null,
  -- At most one featured and two extras per target: checked by the import
  -- script and the school media screen, where the school's layer is known.
  featured boolean not null default false,
  primary key (media_id, target_kind, target_key)
);

-- A school hiding a central record.
create table public.media_hidden (
  school_id uuid not null references public.schools(id) on delete cascade,
  media_id uuid not null references public.media_items(id) on delete cascade,
  primary key (school_id, media_id)
);

-- Central records: anyone signed in reads the active ones. A school's own:
-- that school only (V-X2). What a student may actually be SHOWN is narrowed
-- further in code by allowedRatings() and the school's hidden list; the
-- rating ceiling is not a secrecy rule, so it isn't a row-security rule.
-- V-A4: a school admin writes their school's own records. V-P4: the platform
-- admin writes central ones.
alter table public.media_items enable row level security;
create policy "media: read central, or own school's" on public.media_items
  for select to authenticated
  using (
    (status = 'active' and (school_id is null or school_id in (select public.my_school_ids())))
    or (school_id is not null and public.is_school_admin(school_id))
    or public.is_platform_admin()
  );
create policy "media: school admin writes own school's" on public.media_items
  for all to authenticated
  using (school_id is not null and public.is_school_admin(school_id))
  with check (school_id is not null and public.is_school_admin(school_id));
create policy "media: platform admin writes central" on public.media_items
  for all to authenticated
  using (school_id is null and public.is_platform_admin())
  with check (school_id is null and public.is_platform_admin());

alter table public.media_links enable row level security;
create policy "media links: read with the record" on public.media_links
  for select to authenticated
  using (exists (select 1 from public.media_items m where m.id = media_id));
create policy "media links: write with the record" on public.media_links
  for all to authenticated
  using (exists (
    select 1 from public.media_items m where m.id = media_id
      and ((m.school_id is not null and public.is_school_admin(m.school_id))
        or (m.school_id is null and public.is_platform_admin()))))
  with check (exists (
    select 1 from public.media_items m where m.id = media_id
      and ((m.school_id is not null and public.is_school_admin(m.school_id))
        or (m.school_id is null and public.is_platform_admin()))));

-- V-X2, V-A4.
alter table public.media_hidden enable row level security;
create policy "media hidden: own school reads" on public.media_hidden
  for select to authenticated using (school_id in (select public.my_school_ids()));
create policy "media hidden: school admin writes" on public.media_hidden
  for all to authenticated
  using (public.is_school_admin(school_id)) with check (public.is_school_admin(school_id));


-- ============================================================================
-- 9. TEACHING
-- ============================================================================

-- Set from lesson mode: one self (or strength, or week) for seven days.
create table public.class_focus (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  item_kind text not null default 'self' check (item_kind in ('self', 'strength', 'activity')),
  item_key text not null,
  starts_on date not null default current_date,
  ends_on date not null default (current_date + 7),
  set_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index class_focus_class_idx on public.class_focus (class_id, starts_on desc);

-- A student sees the focus of a class they're in. V-T10: a teacher sets it
-- for a class they teach, and no other. V-A3: a school admin can read it.
alter table public.class_focus enable row level security;
create policy "class focus: members and staff read" on public.class_focus
  for select to authenticated
  using (
    exists (select 1 from public.class_members m where m.class_id = class_focus.class_id and m.student_id = auth.uid())
    or public.can_report_on(class_id)
  );
create policy "class focus: teacher sets" on public.class_focus
  for insert to authenticated with check (public.teaches(class_id));
create policy "class focus: teacher changes" on public.class_focus
  for update to authenticated
  using (public.teaches(class_id)) with check (public.teaches(class_id));
create policy "class focus: teacher removes" on public.class_focus
  for delete to authenticated using (public.teaches(class_id));


-- ============================================================================
-- 10. WHAT STUDENTS CALL
-- ============================================================================

-- V-S6: the only way into a class. Returns the class so the app can show
-- "You've joined 9B with Ms Nguyen". V-C3: the year level comes from the class.
create function public.join_class(p_code text)
returns table (class_id uuid, class_name text, year_level smallint, teacher_name text)
language plpgsql security definer set search_path = public
as $$
declare
  c classes%rowtype;
begin
  if auth.uid() is null then return; end if;
  select * into c from classes
   where join_code = upper(btrim(p_code)) and archived_at is null;
  if not found then return; end if;

  insert into class_members (class_id, student_id) values (c.id, auth.uid())
  on conflict do nothing;
  -- Fires users_year_level(), which copies the class's year level.
  update users set year_level = c.year_level where id = auth.uid();

  return query
    select c.id, c.name, c.year_level, t.display_name
      from (select 1) one left join users t on t.id = c.teacher_id;
end;
$$;

-- V-S5: a student's classes, without the join code.
create function public.my_classes()
returns table (class_id uuid, class_name text, year_level smallint, teacher_id uuid, teacher_name text, school_id uuid)
language sql stable security definer set search_path = public
as $$
  select c.id, c.name, c.year_level, c.teacher_id, t.display_name, c.school_id
    from class_members m
    join classes c on c.id = m.class_id
    left join users t on t.id = c.teacher_id
   where m.student_id = auth.uid() and c.archived_at is null
$$;

-- V-SH1 to V-SH3, V-SH7: the student shares one journal entry with one of
-- their current teachers. The text is copied as it stands now.
-- Returns 'ok', or why not: 'not_yours', 'not_your_teacher'.
create function public.share_entry(p_entry uuid, p_teacher uuid)
returns text language plpgsql security definer set search_path = public
as $$
declare
  e journal_entries%rowtype;
  v_class uuid;
begin
  -- V-SH1: only the entry's owner, acting as themselves.
  select * into e from journal_entries where id = p_entry and user_id = auth.uid();
  if not found then return 'not_yours'; end if;

  -- V-SH2: only a teacher of a class the student is in now.
  select c.id into v_class
    from class_members m join classes c on c.id = m.class_id
   where m.student_id = auth.uid() and c.teacher_id = p_teacher and c.archived_at is null
   order by m.joined_at
   limit 1;
  if v_class is null then return 'not_your_teacher'; end if;

  -- V-SH3: a copy. Sharing again refreshes the copy to the current text.
  insert into shared_items (student_id, teacher_id, class_id, entry_id, prompt, response)
  values (auth.uid(), p_teacher, v_class, e.id, e.prompt, e.response)
  on conflict (entry_id, teacher_id)
  do update set prompt = excluded.prompt, response = excluded.response, shared_at = now();
  return 'ok';
end;
$$;


-- ============================================================================
-- 11. WHAT STAFF CALL  (the only window onto students)
-- ============================================================================

-- V-T5, V-A3: names of the students in a class, and when they joined.
-- V-T6: nothing for a class the caller doesn't teach or administer.
-- V-P2: nothing for a platform admin.
create function public.class_roster(p_class uuid)
returns table (student_id uuid, display_name text, joined_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select m.student_id, u.display_name, m.joined_at
    from class_members m join users u on u.id = m.student_id
   where m.class_id = p_class and public.can_report_on(p_class)
   order by u.display_name
$$;

-- V-T12: a teacher removes a student from their class. Deletes the
-- membership and nothing else (the unshare trigger then applies V-SH9).
create function public.remove_from_class(p_class uuid, p_student uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.can_report_on(p_class) then return false; end if;
  delete from class_members where class_id = p_class and student_id = p_student;
  return found;
end;
$$;

-- V-T11: a teacher issues a new code for a class they teach.
create function public.regenerate_join_code(p_class uuid)
returns text language plpgsql security definer set search_path = public
as $$
declare
  code text;
begin
  if not public.can_report_on(p_class) then return null; end if;
  code := public.new_join_code();
  update classes set join_code = code where id = p_class;
  return code;
end;
$$;

-- V-T9, V-SH6: what students chose to share with THIS teacher. Not the school
-- admin, not another teacher of the class.
create function public.shared_with_me()
returns table (id uuid, student_id uuid, student_name text, class_id uuid, prompt text, response text, shared_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select s.id, s.student_id, u.display_name, s.class_id, s.prompt, s.response, s.shared_at
    from shared_items s
    join users u on u.id = s.student_id
    join classes c on c.id = s.class_id
   where s.teacher_id = auth.uid()
     and c.teacher_id = auth.uid()
   order by s.shared_at desc
$$;

-- The suppression rule, in one place.
--   V-K2: a count from 1 to small_count()-1 is hidden.
--   V-K3: nothing is reported out of a group smaller than small_count().
--   V-K5: hidden too when the REMAINDER is that small ("22 of 24 did" tells
--         you 2 didn't).
--   V-K7: zero is shown, unless V-K5 hides it.
-- Returns null for "hidden". The UI shows a dash (V-K9).
create function public.safe_count(p_n int, p_out_of int)
returns int language sql immutable
as $$
  select case
    when p_n is null or p_out_of is null then null
    when p_out_of < public.small_count() then null
    when p_n > 0 and p_n < public.small_count() then null
    when p_out_of - p_n > 0 and p_out_of - p_n < public.small_count() then null
    else p_n
  end
$$;

-- V-T7, V-T8, V-A3: class-level patterns, as counts and nothing else.
--
-- Returns rows of (section, key, students, out_of):
--   class       too_small | members
--   self_check  taken | level-1 .. level-7   how many students' most recent
--               self-check suggests exploring that level (a student can
--               count in more than one level)
--   focus       <item key>:opened | :accepted | :done
-- `students` is null when the figure is hidden.
--
-- V-K8: all suppression happens here; the true figure never leaves.
-- V-K10: it takes a class and nothing finer. Don't add a filter.
-- V-K11: only what happened before today (database time, UTC) is counted, so
--   the figures move once a day, not as each student acts.
create function public.class_patterns(p_class uuid)
returns table (section text, key text, students int, out_of int)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_size int;
  v_taken int;
  v_levels int[];
  v_safe int[];
  v_hidden int := 0;
  v_min_at int;
  v_focus class_focus%rowtype;
  v_opened int;
  v_accepted int;
  v_done int;
  i int;
begin
  -- V-T6.
  if not public.can_report_on(p_class) then return; end if;

  select count(*)::int into v_size
    from class_members m
   where m.class_id = p_class and m.joined_at < current_date;

  -- V-K4: a class under the minimum gets no figures at all.
  if v_size < public.small_count() then
    return query select 'class'::text, 'too_small'::text, null::int, null::int;
    return;
  end if;

  -- Not a secret: the teacher has the roster.
  return query select 'class'::text, 'members'::text, v_size, v_size;

  -- ── Self-check pattern (spec section 6, rule 6) ──────────────────────────
  with latest as (
    select distinct on (sc.student_id) sc.student_id, sc.suggested
      from self_checks sc
      join class_members m on m.student_id = sc.student_id
     where m.class_id = p_class
       and m.joined_at < current_date
       and sc.taken_at < current_date
     order by sc.student_id, sc.taken_at desc
  )
  select
    (select count(*)::int from latest),
    (select array_agg(n order by lv)
       from (
         select g.lv,
                (select count(*)::int from latest l where l.suggested -> 'levels' @> to_jsonb(g.lv)) as n
           from generate_series(1, 7) as g(lv)
       ) per_level)
    into v_taken, v_levels;

  return query select 'self_check'::text, 'taken'::text, public.safe_count(v_taken, v_size), v_size;

  -- Only break it down by level when "how many took it" is itself showable.
  if public.safe_count(v_taken, v_size) is not null then
    for i in 1..7 loop
      v_safe[i] := public.safe_count(v_levels[i], v_taken);
      if v_safe[i] is null then v_hidden := v_hidden + 1; end if;
    end loop;

    -- V-K6: if exactly one level is hidden, hide the next-smallest too.
    if v_hidden = 1 then
      v_min_at := null;
      for i in 1..7 loop
        if v_safe[i] is not null and (v_min_at is null or v_safe[i] < v_safe[v_min_at]) then
          v_min_at := i;
        end if;
      end loop;
      if v_min_at is not null then v_safe[v_min_at] := null; end if;
    end if;

    for i in 1..7 loop
      return query select 'self_check'::text, 'level-' || i, v_safe[i], v_taken;
    end loop;
  end if;

  -- ── This week's focus (spec section 7, "What the teacher sees afterwards") ─
  select * into v_focus
    from class_focus f
   where f.class_id = p_class and current_date between f.starts_on and f.ends_on
   order by f.starts_on desc, f.created_at desc
   limit 1;

  if found and v_focus.item_kind = 'self' then
    select
      count(*) filter (where p.opened_at >= v_focus.starts_on and p.opened_at < current_date)::int,
      count(*) filter (where p.challenge_accepted_at >= v_focus.starts_on and p.challenge_accepted_at < current_date)::int,
      count(*) filter (where p.challenge_done_at >= v_focus.starts_on and p.challenge_done_at < current_date)::int
      into v_opened, v_accepted, v_done
      from self_progress p
      join class_members m on m.student_id = p.student_id
     where m.class_id = p_class
       and m.joined_at < current_date
       and p.self_key = v_focus.item_key;

    return query select 'focus'::text, v_focus.item_key || ':opened', public.safe_count(v_opened, v_size), v_size;
    return query select 'focus'::text, v_focus.item_key || ':accepted', public.safe_count(v_accepted, v_size), v_size;
    return query select 'focus'::text, v_focus.item_key || ':done', public.safe_count(v_done, v_size), v_size;
  end if;
end;
$$;

-- V-P3: anonymous totals for the platform admin. No school, class or person
-- can be picked out, and a small count of students is hidden. (How many
-- schools and classes exist isn't about any student, so those are shown.)
create function public.platform_totals()
returns table (key text, total int)
language plpgsql stable security definer set search_path = public
as $$
declare
  k int := public.small_count();
begin
  if not public.is_platform_admin() then return; end if;
  return query
    select t.key, case when t.about_students and t.n > 0 and t.n < k then null else t.n end
      from (
        select 'schools'::text as key, false as about_students, (select count(*)::int from schools) as n
        union all select 'classes', false, (select count(*)::int from classes where archived_at is null)
        union all select 'students_in_classes', true, (select count(distinct student_id)::int from class_members)
        union all select 'students_on_their_own', true,
          (select count(*)::int from users u
            where not exists (select 1 from class_members m where m.student_id = u.id)
              and not exists (select 1 from staff s where s.user_id = u.id)
              and not exists (select 1 from platform_admins a where a.user_id = u.id))
        union all select 'self_checks_taken', true, (select count(distinct student_id)::int from self_checks)
      ) t;
end;
$$;


-- ============================================================================
-- 12. CARRIED OVER FROM v2, UNCHANGED
-- ============================================================================

-- V-N2: the two functions behind "ask someone by link". Someone holding an
-- unexpired link reads that one request's questions and submits one answer.
-- Copied verbatim from v2 (supabase/migrations/017_conversation_requests.sql).

-- What the answer page shows. Nothing about the student beyond the name they
-- chose to give, and nothing at all once the link has expired or been used.
create function public.get_conversation_request(p_token text)
returns table (
  from_name text,
  for_label text,
  questions jsonb,
  activity_id text,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.from_name,
    r.for_label,
    case when r.answered_at is null and r.expires_at > now() then r.questions else '[]'::jsonb end,
    r.activity_id,
    case
      when r.answered_at is not null then 'answered'
      when r.expires_at <= now() then 'expired'
      else 'open'
    end
  from public.conversation_requests r
  where r.token = p_token;
$$;

-- Saves the answers, once. Returns 'ok', or why not: 'not_found', 'answered',
-- 'expired' or 'invalid'.
create function public.answer_conversation_request(
  p_token text,
  p_answers jsonb,
  p_responder text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.conversation_requests%rowtype;
  a jsonb;
begin
  select * into r from public.conversation_requests where token = p_token for update;
  if not found then return 'not_found'; end if;
  if r.answered_at is not null then return 'answered'; end if;
  if r.expires_at <= now() then return 'expired'; end if;

  if p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) <> jsonb_array_length(r.questions)
     or char_length(coalesce(p_responder, '')) > 60 then
    return 'invalid';
  end if;
  for a in select * from jsonb_array_elements(p_answers) loop
    if jsonb_typeof(a) <> 'string' or char_length(a #>> '{}') > 3000 then
      return 'invalid';
    end if;
  end loop;
  -- At least one real answer: something other than spaces, tabs or newlines.
  if not exists (
    select 1 from jsonb_array_elements_text(p_answers) t where t ~ '\S'
  ) then
    return 'invalid';
  end if;

  update public.conversation_requests
     set answers = p_answers,
         responder_name = nullif(btrim(p_responder, E' \t\r\n'), ''),
         answered_at = now()
   where id = r.id;
  return 'ok';
end;
$$;

-- v2's totals views (migrations 015 and 021): how many students finished each
-- step and week, and opened, finished and reflected on each story. Service
-- role only, read by scripts/completion-report.ts, which hides small counts.
create view public.signup_counts as
  select
    count(*)::int as students,
    count(*) filter (where onboarding_complete)::int as onboarded
  from public.users;

create view public.step_completion_counts as
  select mission_id, activity_id, count(distinct user_id)::int as students
  from public.mission_progress
  group by mission_id, activity_id;

create view public.week_completion_counts as
  select
    week,
    count(*)::int as started,
    count(*) filter (where completed_at is not null)::int as finished
  from public.program_progress
  group by week;

create view public.story_engagement_counts as
  select
    s.id as story_id,
    s.mission_id,
    s.title,
    count(r.user_id) filter (
      where r.opened_at is not null or r.read_at is not null or r.actioned_at is not null
    )::int as opened,
    count(r.user_id) filter (where r.read_at is not null)::int as finished,
    count(r.user_id) filter (where r.actioned_at is not null)::int as reflected
  from public.stories s
  left join public.story_reads r on r.story_id = s.id
  group by s.id, s.mission_id, s.title;

revoke all on public.signup_counts from anon, authenticated;
revoke all on public.step_completion_counts from anon, authenticated;
revoke all on public.week_completion_counts from anon, authenticated;
revoke all on public.story_engagement_counts from anon, authenticated;
grant select on public.signup_counts to service_role;
grant select on public.step_completion_counts to service_role;
grant select on public.week_completion_counts to service_role;
grant select on public.story_engagement_counts to service_role;


-- ============================================================================
-- 13. WHO MAY CALL WHAT
-- ============================================================================

-- V-N1: a signed-out visitor reads no table.
revoke all on all tables in schema public from anon;

-- Functions are callable only by the roles named here. Each one checks the
-- caller's role itself and returns nothing to anyone else (V-S4, V-T6, V-P2).
revoke all on all functions in schema public from public;
revoke all on all functions in schema public from anon;

grant execute on function
  public.small_count(),
  public.is_platform_admin(),
  public.is_school_admin(uuid),
  public.is_staff(),
  public.teaches(uuid),
  public.can_report_on(uuid),
  public.my_school_ids(),
  public.join_class(text),
  public.my_classes(),
  public.share_entry(uuid, uuid),
  public.class_roster(uuid),
  public.remove_from_class(uuid, uuid),
  public.regenerate_join_code(uuid),
  public.shared_with_me(),
  public.class_patterns(uuid),
  public.platform_totals(),
  public.teacher_notes(text)
to authenticated;

-- V-N2.
grant execute on function public.get_conversation_request(text) to anon, authenticated;
grant execute on function public.answer_conversation_request(text, jsonb, text) to anon, authenticated;
