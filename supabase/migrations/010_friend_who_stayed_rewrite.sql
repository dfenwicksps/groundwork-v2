-- ============================================================
-- Migration 010 — Rewrite "The Friend Who Stayed"
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The story is now told as an animated film (src/components/stories/
-- FriendWhoStayedFilm.tsx). This brings the stored prose in line with the
-- film's script: concrete details (the texts Leon kept sending, the chips and
-- the footy, "I was in the area"), the one line Jonah does say, and an ending
-- that turns outward — he still hasn't told Leon, but he's become the friend
-- who keeps texting. A third, small-step reflection prompt is added.
--
-- Journal entries keep their own copy of the prompt text, so any reflections
-- already written against the old prompts are unaffected.
update public.stories
set teaser = 'When his parents split up, Jonah started pulling away before his friends could drift. One of them wouldn''t let him.',
    context = 'In the middle of Year 9, Jonah''s parents split up. His dad moved into a flat across town, and the house went quiet in a new way. Jonah didn''t tell anyone at school — not even Leon. He got quieter. He said he was "just tired". He cancelled on Saturday, then the Saturday after. He''d seen how it went when things got hard for someone — people drifted. So he started drifting first. Leon didn''t take the hint. He kept texting — never about anything. A dog in a hoodie. Who was coming on Saturday. Jonah left most of them on read. Leon kept sending them anyway.',
    turning_point = 'Then one Saturday, the doorbell. Leon was standing there with a packet of chips and a footy. "I was in the area," he said. He lived twenty minutes away. They sat on the back step for an hour. Kicked the footy against the fence a bit. Mostly didn''t talk. Leon didn''t ask what was wrong, and he didn''t say anything wise. He just stayed. Near the end, without planning to, Jonah said it: "Dad moved out." Leon nodded. "Figured it was something." Then he passed the chips. That was the whole conversation. It was enough. Later, Jonah worked out what that afternoon had been. Not someone rescuing him — nobody fixed anything. Just someone refusing to let him disappear. He''s never told Leon what it meant. He still hasn''t. But these days, when a mate goes quiet, Jonah''s the one who keeps sending the dog videos.',
    reflection_prompts = ARRAY[
   'Think about a time someone showed up for you without making a big deal of it. What did they actually do — and what did it mean to you?',
   'Is there someone you''ve been pulling away from before they can drift? What would it look like to let them back in, even a little?',
   'Is there someone who''s gone a bit quiet lately? What''s one small, ordinary thing you could send or do this week — no big conversation needed?'
 ]
where title = 'The Friend Who Stayed';
