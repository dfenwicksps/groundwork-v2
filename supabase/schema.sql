-- ============================================================
-- GROUNDWORK — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- Project: https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- TABLES
-- ============================================================

-- Users profile (mirrors auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null,
  onboarding_complete boolean default false not null,
  active_mission int default 1 not null
);

-- Onboarding results
create table if not exists public.onboarding_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  why_here text,
  strengths text[],
  values text[],
  completed_at timestamptz default now() not null
);

-- Journal entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  mission_id int not null,
  activity_id text not null,
  prompt text not null,
  response text not null default '',
  ai_reflection text,
  is_milestone boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Weekly challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  mission_id int not null,
  challenge_text text not null,
  issued_at timestamptz default now() not null,
  completed_at timestamptz,
  debrief_response text
);

-- Support circle (trusted adults)
create table if not exists public.support_circle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  relationship text not null,
  added_at timestamptz default now() not null
);

-- Mission progress tracking
create table if not exists public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  mission_id int not null,
  activity_id text not null,
  completed_at timestamptz default now() not null,
  unique(user_id, mission_id, activity_id)
);

-- Stories library
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  mission_id int not null,
  title text not null,
  teaser text not null,
  context text not null,
  turning_point text not null,
  reflection_prompts text[] not null,
  tags text[] not null default '{}'
);

-- Practical goals (WOOP-lite)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  domain text not null check (domain in ('school','life','future')),
  wish text not null,
  outcome text,
  obstacle text,
  plan text,
  linked_value text,
  linked_strength text,
  status text not null default 'active' check (status in ('active','done','archived')),
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  reflection text
);

-- Strength-in-action practice log (non-streak)
create table if not exists public.practice_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  strength_key text not null,
  action text not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  reflection text
);

-- Moral decision-making profile (one row per user)
create table if not exists public.moral_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  style_scores jsonb not null,
  primary_style text not null,
  secondary_style text,
  answers jsonb,
  taken_at timestamptz default now() not null
);

-- VIA-24 character strengths profile (one row per user; retake overwrites)
create table if not exists public.strength_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  scores jsonb not null,       -- { "creativity": 4, "kindness": 2, ... } (all 24)
  ranking text[] not null,      -- ["kindness","creativity", ...] high -> low (24)
  answers jsonb,                -- raw picks { most: [...], least: [...] } for retake prefill
  taken_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.onboarding_results enable row level security;
alter table public.journal_entries enable row level security;
alter table public.challenges enable row level security;
alter table public.support_circle enable row level security;
alter table public.mission_progress enable row level security;
alter table public.stories enable row level security;
alter table public.strength_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.practice_log enable row level security;
alter table public.moral_profiles enable row level security;

-- users: own row only
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- onboarding_results: own rows only
create policy "Users can manage own onboarding"
  on public.onboarding_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- journal_entries: own rows only
create policy "Users can manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- challenges: own rows only
create policy "Users can manage own challenges"
  on public.challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- support_circle: own rows only
create policy "Users can manage own support circle"
  on public.support_circle for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- mission_progress: own rows only
create policy "Users can manage own mission progress"
  on public.mission_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- stories: public read, no user writes
create policy "Stories are publicly readable"
  on public.stories for select
  to authenticated
  using (true);

-- strength_profiles: own row only
create policy "Users can manage own strength profile"
  on public.strength_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- goals / practice_log / moral_profiles: own rows only
create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own practice log"
  on public.practice_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own moral profile"
  on public.moral_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================
-- TRIGGER: auto-create user profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- TRIGGER: updated_at on journal_entries
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();


-- ============================================================
-- SEED: STORIES
-- 8 stories, 2 per mission (fictional but grounded)
-- ============================================================

insert into public.stories (mission_id, title, teaser, context, turning_point, reflection_prompts, tags)
values

-- Mission 1 — Identity
(1,
 'The Version of Me at School',
 'Priya always knew who she was at home — but at school, she kept becoming someone else.',
 'Priya had always been loud at home. She made her family laugh, she argued confidently about things she cared about, she sang badly and on purpose. But at school she was quieter. Careful. She said yes when she meant maybe, laughed at things she didn''t find funny, and wore a version of herself that felt slightly wrong — like shoes that were almost her size.',
 'In Year 10, her English teacher asked the class to write about someone they admired. Priya wrote about her grandmother, who had never once apologised for taking up space. When she read it aloud, her voice cracked. The room was quiet in a way that felt different from usual. Afterwards, a girl she barely knew said, "That was really something." Priya realised she hadn''t been performing at all. She''d just been herself. It felt enormous.',
 ARRAY[
   'Think about a time you felt the gap between who you are and who you were performing. What was happening?',
   'What would it take to bring a little more of your real self into the spaces where you usually hold back?'
 ],
 ARRAY['identity', 'authenticity', 'school']
),

(1,
 'What the Mirror Doesn''t Show',
 'Marcus spent years building a version of himself based on what others expected — until a quiet moment changed everything.',
 'Marcus was the kind of person other people found easy to like. He was good at reading rooms, adjusting his humour to whoever he was with, downplaying things he cared about if they seemed uncool. It worked. He had plenty of friends. But late at night, he sometimes felt like he''d spent the whole day slightly impersonating himself. Like the real him was somewhere just behind his own face, watching.',
 'His older brother came home for the holidays and asked Marcus what he actually wanted to do with his life — not what he''d told other people, but what he actually wanted. Marcus went to answer and realised he didn''t know. He''d been so focused on fitting in that he''d stopped noticing what he genuinely wanted. That question stayed with him for weeks. He started a private journal. Not to figure himself out, but just to start telling the truth.',
 ARRAY[
   'Is there a version of yourself you''ve been performing for others? What does that version look and sound like?',
   'When do you feel most like yourself — not the performed version, but the actual you?'
 ],
 ARRAY['identity', 'authenticity', 'self-knowledge']
),

-- Mission 2 — Purpose
(2,
 'The Thing She Couldn''t Ignore',
 'Amara didn''t set out to care about the river. Then she did, and it changed everything.',
 'Amara had walked past the creek behind her school every day for three years without really seeing it. Then one afternoon she was sitting near it after a hard day, and she noticed the foam at the edge of the water. Not normal foam. She looked it up. She started reading. Within a week she knew more about stormwater runoff than her science teacher, and she couldn''t stop thinking about it.',
 'She started small — a petition she didn''t expect anyone to sign. Then sixty people signed it. Then she was presenting to the local council at 16, nervous and underprepared, reading from notes she''d handwritten the night before. She didn''t change everything. But something shifted inside her — a feeling that she was pointing in a direction that was actually hers. The problem was real. Her anger was real. And that was enough to start.',
 ARRAY[
   'Is there something in the world that makes you quietly angry or sad — something you can''t quite leave alone?',
   'What would it look like to take one small step toward something you genuinely care about?'
 ],
 ARRAY['purpose', 'values', 'action']
),

(2,
 'The Coach Who Stopped Winning',
 'He''d built his whole identity around results — until a conversation with a struggling player made him rethink everything.',
 'Daniel had been coaching the school''s junior football team for two years. He was good at it, and he knew it. His teams won more than they lost, and he liked the feeling that came with that. But in the middle of the season, one of his quietest players started showing up late, then not at all. Daniel tracked him down and asked what was going on. The boy shrugged and said, "I don''t think I''m meant to be here."',
 'Daniel sat with that for days. He''d been coaching to win. He hadn''t been coaching to make players feel like they belonged. He changed how he ran training — more questions, less instruction. Slower. He stopped tracking wins on a whiteboard. Two players who''d been on the edge of quitting didn''t. By the end of the season, his win rate had dropped. But after the last game, three players came up and thanked him in a way they never had before. He understood, for the first time, what he actually cared about.',
 ARRAY[
   'Have you ever been good at something, but not doing it for the right reasons? What did that feel like?',
   'What would it look like to do the same thing — but with a different purpose behind it?'
 ],
 ARRAY['purpose', 'values', 'leadership']
),

-- Mission 3 — Connection
(3,
 'The Friend Who Stayed',
 'When everything fell apart, Jonah expected people to disappear. One person didn''t.',
 'Jonah''s parents separated in the middle of Year 9. He didn''t tell anyone at school. He became quieter, more distracted, quicker to cancel plans. He assumed his friends would drift — that''s what he''d seen happen with other people in hard situations. He started pulling away before they could.',
 'His friend Leon didn''t take the hint. He kept texting. Not about anything in particular — just memes, questions about the weekend, ordinary things. One afternoon he came over unannounced and they sat in the backyard for an hour barely talking. It wasn''t a big conversation. Leon didn''t ask what was wrong. He just stayed. Later, Jonah realised that''s what real connection had felt like — not someone rescuing him, just someone refusing to let him disappear. He''d never told Leon how much that had meant. He still hasn''t, but he thinks about it.',
 ARRAY[
   'Think about a time someone showed up for you without making a big deal of it. What did that mean to you?',
   'Is there someone in your life you''ve been pulling away from? What would it look like to let them back in, even a little?'
 ],
 ARRAY['connection', 'friendship', 'vulnerability']
),

(3,
 'Different Enough',
 'Sofia and her mum had nothing in common — until they found the one thing they did.',
 'Sofia and her mother had been in low-level conflict for as long as she could remember. Different temperaments, different interests, different ways of seeing the world. Her mother was practical, routine-driven, and uncomfortable with big emotions. Sofia was none of those things. Family dinners often ended with at least one of them retreating to a different room.',
 'The summer Sofia was 15, the power went out during a storm and they ended up on the back veranda with candles and no screens. Her mother started talking — really talking — about her own teenage years, things Sofia had never heard before. Sofia realised she''d never thought of her mother as someone who''d once been her age, uncertain and searching. They weren''t suddenly best friends. The conflict didn''t disappear. But something opened up — a small gap through which something more honest could pass. Sofia started trying to find that gap more often.',
 ARRAY[
   'Think about a relationship in your life that feels difficult. What do you actually know about that person''s inner life?',
   'Have you ever seen someone differently after learning something new about them? What changed?'
 ],
 ARRAY['connection', 'family', 'empathy']
),

-- Mission 4 — Meaning
(4,
 'The Slow Way There',
 'Eli had always chased the next milestone. It took a gap year in the wrong direction to teach him something better.',
 'Eli had spent most of high school being extremely focused. Good grades, right subjects, right activities. He''d built a pathway in his mind and he walked it carefully. The problem was that he was so focused on arriving somewhere that he''d stopped noticing whether the somewhere he was aimed at was actually where he wanted to go. He''d just assumed the destination was the point.',
 'He deferred his university offer and spent six months working at a small bakery in a town he''d driven through once and liked. It was the most boring and clarifying thing he''d ever done. He got up at 4am. He made the same things each day. He had long evenings with nothing to fill them. He started reading books he actually wanted to read, not books he thought he should. He didn''t find a grand purpose. But he learned the difference between a life built around arrival and a life built around actually being alive.',
 ARRAY[
   'Is there something you''re working toward that you chose deliberately — or did you inherit it from what other people expected?',
   'What does a good ordinary day look like to you — not a highlight, just a day that feels like yours?'
 ],
 ARRAY['meaning', 'purpose', 'future']
),

(4,
 'Enough',
 'Grace had everything she was supposed to want. Why didn''t it feel like anything?',
 'By the end of Year 12, Grace had achieved almost everything she''d aimed at. Good ATAR, place in the degree she''d said she wanted, a social life that looked full from the outside. She''d been told she should feel proud. She did feel something — but it was more like relief, followed quickly by a strange flatness. She didn''t know what to point herself at next. The checklist had run out.',
 'She took a gap semester and spent time with her grandmother, who was 78 and one of the most contented people she''d ever known. She asked her grandmother what the secret was. Her grandmother thought about it for a while and said: "I stopped trying to build a life worth showing people. I started building one worth waking up inside." Grace wrote it down. She''s still figuring out what it means for her, but it feels like the right question.',
 ARRAY[
   'Have you ever achieved something you worked hard for, only to feel oddly empty afterwards? What did that tell you?',
   'What does "a life worth waking up inside" mean to you?'
 ],
 ARRAY['meaning', 'success', 'future']
);


-- ============================================================
-- DONE
-- ============================================================
-- Verify with:
-- select * from public.stories;
-- select count(*) from public.stories;
