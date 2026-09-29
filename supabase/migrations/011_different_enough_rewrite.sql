-- ============================================================
-- Migration 011 — Rewrite "Different Enough"
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The story is now told as an animated film (src/components/stories/
-- DifferentEnoughFilm.tsx). This brings the stored prose in line with the
-- film's script. The old teaser promised "the one thing they did" have in
-- common but the story never said what it was; now it's drawing — Mum filled a
-- sketchbook at sixteen and never showed anyone — and the ending is a sticky
-- note, in Mum's own list-and-label language, rather than a summary. A third,
-- small-step reflection prompt is added.
--
-- Journal entries keep their own copy of the prompt text, so any reflections
-- already written against the old prompts are unaffected.
update public.stories
set teaser = 'Sofia and her mum had nothing in common — until a blackout, a candle, and a story Sofia had never heard.',
    context = 'Sofia and her mum ran on different settings. Mum had lists, labelled freezer containers and dinner at six-thirty sharp. Sofia had big feelings, no plan, and a sketchbook she drew in instead of doing homework. Most dinners went the same way: a comment, a sigh, someone saying "I''m just being honest" — and one of them taking their plate to another room. They lived ten metres apart and hardly knew each other. Sofia figured that was just how it was going to be.',
    turning_point = 'The summer Sofia was fifteen, a storm took the power out. No wifi. No TV. Phone on four per cent. Just a candle, and the two of them on the back veranda, waiting. Then, out of nowhere, Mum started talking. About being sixteen and not knowing what she wanted. About an art teacher who told her she was good. About a sketchbook she filled that year and never showed anyone. Sofia had never once pictured her mum at her age — unsure, searching, drawing in the margins. She sat in the candlelight trying to fit the two people together. When the power came back, Mum blew out the candle and went to check the freezer. They weren''t suddenly best friends. The arguments didn''t stop. But something had opened — a small gap where something more honest could get through. A few weeks later, Sofia left her sketchbook open on the kitchen bench. Mum didn''t say anything. She just stuck a note on one page: "This one."',
    reflection_prompts = ARRAY[
   'Think about a relationship in your life that feels difficult. What do you actually know about that person''s inner life?',
   'Have you ever seen someone differently after learning something new about them? What changed — in them, or in you?',
   'Pick someone you clash with. What''s one question you could ask them this week about when they were your age?'
 ]
where title = 'Different Enough';
