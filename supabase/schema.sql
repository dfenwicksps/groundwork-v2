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
  -- When set, this entry is a revisit looking back at another entry. Lets one
  -- entry be revisited repeatedly over months, forming a readable chain.
  revisit_of uuid references public.journal_entries(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists journal_entries_revisit_of_idx
  on public.journal_entries (revisit_of, created_at);

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

-- Story engagement — one row per (user, story). read_at is set when the
-- student reaches the end of a story (or finishes its animated telling);
-- actioned_at when they follow one of its reflection prompts into the journal.
-- Both set = the green tick on the stories list.
create table if not exists public.story_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  read_at timestamptz,
  actioned_at timestamptz,
  unique(user_id, story_id)
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

-- The Standard — recurring three-question check-in (one row per check-in;
-- history is the point, so nothing is overwritten)
-- Also holds the program's weekly five: `set` discriminates the question set
-- ('standard' = the three-part test, 'weekly' = the weekly five).
create table if not exists public.standard_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  answers jsonb not null default '{}'::jsonb,  -- keyed by question key
  set text not null default 'standard',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists standard_checkins_user_set_created_idx
  on public.standard_checkins (user_id, set, created_at desc);

-- The 10-Week Character Program — one row per user per week they've started
create table if not exists public.program_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  week int not null check (week between 1 and 10),
  days jsonb not null default '[]'::jsonb,  -- ticked day/session indices
  commitment text,                          -- the week's own promise or hill
  reflection text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  unique (user_id, week)
);

create index if not exists program_progress_user_week_idx
  on public.program_progress (user_id, week);

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
alter table public.story_reads enable row level security;
alter table public.strength_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.practice_log enable row level security;
alter table public.moral_profiles enable row level security;
alter table public.standard_checkins enable row level security;
alter table public.program_progress enable row level security;

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

-- story_reads: own rows only
create policy "Users can manage own story reads"
  on public.story_reads for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

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

-- standard_checkins: own rows only
create policy "Users can manage own standard checkins"
  on public.standard_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- program_progress: own rows only
create policy "Users can manage own program progress"
  on public.program_progress for all
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
 'At home, Priya took up space. At school, she shrank to fit — until an English assignment asked who she admired.',
 'At home, Priya took up the whole room. She did impressions that made her family beg her to stop, argued at dinner about things she actually cared about, and sang badly — loudly, on purpose. But every morning, somewhere between the front door and the school gate, she turned herself down. At school she was quieter. Careful. She said yes when she meant maybe and laughed at jokes she didn''t find funny. Nobody noticed, which was sort of the point — and sort of the problem. It was a version of her that almost fitted, like shoes half a size too small.',
 'In Year 10, her English teacher set a piece of writing: someone you admire. Priya nearly picked someone safe. Instead she wrote about her grandmother, a woman who had never once apologised for taking up space. Reading it aloud, her voice cracked halfway through. Everyone heard it. She could have stopped, made a joke, sat down. She kept going. When she finished, the room was quiet — not the bored kind, the listening kind. At lunch, a girl she barely knew caught up with her and said, "That was really something." Priya realised she hadn''t been performing at all. For five minutes, the version of her at home and the version of her at school had been the same person. It felt enormous. The next day she was still quieter at school than at home — that didn''t just vanish. But she only laughed when something was funny. And she''d seen the mask for what it was: something she could take off.',
 ARRAY[
   'Think about a time you felt the gap between who you are and who you were performing. What was happening — and who were you performing for?',
   'What''s one thing people at home know about you that people at school don''t? What do you think would happen if they found out?',
   'Priya didn''t plan to be brave — she just didn''t stop. Where''s one small, low-stakes place you could let a bit more of your real self show this week?'
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
 'When his parents split up, Jonah started pulling away before his friends could drift. One of them wouldn''t let him.',
 'In the middle of Year 9, Jonah''s parents split up. His dad moved into a flat across town, and the house went quiet in a new way. Jonah didn''t tell anyone at school — not even Leon. He got quieter. He said he was "just tired". He cancelled on Saturday, then the Saturday after. He''d seen how it went when things got hard for someone — people drifted. So he started drifting first. Leon didn''t take the hint. He kept texting — never about anything. A dog in a hoodie. Who was coming on Saturday. Jonah left most of them on read. Leon kept sending them anyway.',
 'Then one Saturday, the doorbell. Leon was standing there with a packet of chips and a footy. "I was in the area," he said. He lived twenty minutes away. They sat on the back step for an hour. Kicked the footy against the fence a bit. Mostly didn''t talk. Leon didn''t ask what was wrong, and he didn''t say anything wise. He just stayed. Near the end, without planning to, Jonah said it: "Dad moved out." Leon nodded. "Figured it was something." Then he passed the chips. That was the whole conversation. It was enough. Later, Jonah worked out what that afternoon had been. Not someone rescuing him — nobody fixed anything. Just someone refusing to let him disappear. He''s never told Leon what it meant. He still hasn''t. But these days, when a mate goes quiet, Jonah''s the one who keeps sending the dog videos.',
 ARRAY[
   'Think about a time someone showed up for you without making a big deal of it. What did they actually do — and what did it mean to you?',
   'Is there someone you''ve been pulling away from before they can drift? What would it look like to let them back in, even a little?',
   'Is there someone who''s gone a bit quiet lately? What''s one small, ordinary thing you could send or do this week — no big conversation needed?'
 ],
 ARRAY['connection', 'friendship', 'vulnerability']
),

(3,
 'Different Enough',
 'Sofia and her mum had nothing in common — until a blackout, a candle, and a story Sofia had never heard.',
 'Sofia and her mum ran on different settings. Mum had lists, labelled freezer containers and dinner at six-thirty sharp. Sofia had big feelings, no plan, and a sketchbook she drew in instead of doing homework. Most dinners went the same way: a comment, a sigh, someone saying "I''m just being honest" — and one of them taking their plate to another room. They lived ten metres apart and hardly knew each other. Sofia figured that was just how it was going to be.',
 'The summer Sofia was fifteen, a storm took the power out. No wifi. No TV. Phone on four per cent. Just a candle, and the two of them on the back veranda, waiting. Then, out of nowhere, Mum started talking. About being sixteen and not knowing what she wanted. About an art teacher who told her she was good. About a sketchbook she filled that year and never showed anyone. Sofia had never once pictured her mum at her age — unsure, searching, drawing in the margins. She sat in the candlelight trying to fit the two people together. When the power came back, Mum blew out the candle and went to check the freezer. They weren''t suddenly best friends. The arguments didn''t stop. But something had opened — a small gap where something more honest could get through. A few weeks later, Sofia left her sketchbook open on the kitchen bench. Mum didn''t say anything. She just stuck a note on one page: "This one."',
 ARRAY[
   'Think about a relationship in your life that feels difficult. What do you actually know about that person''s inner life?',
   'Have you ever seen someone differently after learning something new about them? What changed — in them, or in you?',
   'Pick someone you clash with. What''s one question you could ask them this week about when they were your age?'
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
