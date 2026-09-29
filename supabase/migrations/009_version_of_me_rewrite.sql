-- ============================================================
-- Migration 009 — Rewrite "The Version of Me at School"
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The story is now told as an animated film (src/components/stories/
-- VersionOfMeFilm.tsx). This brings the stored prose in line with the film's
-- script: more concrete scenes, the moment she nearly stops reading, and an
-- ending that doesn't pretend one good afternoon fixed everything. A third,
-- smaller-step reflection prompt is added.
--
-- The old prompts were only ever reachable via a link that dropped them, so no
-- journal entries reference them and nothing is orphaned by the change.
update public.stories
set teaser = 'At home, Priya took up space. At school, she shrank to fit — until an English assignment asked who she admired.',
    context = 'At home, Priya took up the whole room. She did impressions that made her family beg her to stop, argued at dinner about things she actually cared about, and sang badly — loudly, on purpose. But every morning, somewhere between the front door and the school gate, she turned herself down. At school she was quieter. Careful. She said yes when she meant maybe and laughed at jokes she didn''t find funny. Nobody noticed, which was sort of the point — and sort of the problem. It was a version of her that almost fitted, like shoes half a size too small.',
    turning_point = 'In Year 10, her English teacher set a piece of writing: someone you admire. Priya nearly picked someone safe. Instead she wrote about her grandmother, a woman who had never once apologised for taking up space. Reading it aloud, her voice cracked halfway through. Everyone heard it. She could have stopped, made a joke, sat down. She kept going. When she finished, the room was quiet — not the bored kind, the listening kind. At lunch, a girl she barely knew caught up with her and said, "That was really something." Priya realised she hadn''t been performing at all. For five minutes, the version of her at home and the version of her at school had been the same person. It felt enormous. The next day she was still quieter at school than at home — that didn''t just vanish. But she only laughed when something was funny. And she''d seen the mask for what it was: something she could take off.',
    reflection_prompts = ARRAY[
   'Think about a time you felt the gap between who you are and who you were performing. What was happening — and who were you performing for?',
   'What''s one thing people at home know about you that people at school don''t? What do you think would happen if they found out?',
   'Priya didn''t plan to be brave — she just didn''t stop. Where''s one small, low-stakes place you could let a bit more of your real self show this week?'
 ]
where title = 'The Version of Me at School';
