-- ============================================================
-- Gifted Platform — Tracks / Pathways System
-- Phase 2: Auto-tagging existing competitions, courses, exams
-- Run in Supabase > SQL Editor (after Phase 1)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. Add Geography — it's an active subject in the data but
--    wasn't in the original Phase 1 seed list
-- ────────────────────────────────────────────────────────────

INSERT INTO public.tracks (name, slug, sort_order) VALUES
  ('Geography', 'geography', 7)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 1. Tag competitions directly from their `type` array
--    e.g. type = ["Mathematics","Science","ICT"] → tagged into all three tracks
-- ────────────────────────────────────────────────────────────

INSERT INTO public.track_items (track_id, item_type, item_id)
SELECT DISTINCT t.id, 'competition', c.id
FROM public.competitions c
CROSS JOIN LATERAL unnest(c.type) AS subject
JOIN public.tracks t ON t.name = subject
ON CONFLICT (track_id, item_type, item_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. Tag courses directly from their `category` array
-- ────────────────────────────────────────────────────────────

INSERT INTO public.track_items (track_id, item_type, item_id)
SELECT DISTINCT t.id, 'course', co.id
FROM public.courses co
CROSS JOIN LATERAL unnest(co.category) AS subject
JOIN public.tracks t ON t.name = subject
ON CONFLICT (track_id, item_type, item_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 3. Cascade-tag exams via competitions.assessments → exams.mongo_id
--    Exams have no subject field of their own — they inherit the
--    subject(s) of every competition that lists them in `assessments`
-- ────────────────────────────────────────────────────────────

INSERT INTO public.track_items (track_id, item_type, item_id)
SELECT DISTINCT t.id, 'exam', e.id
FROM public.competitions c
CROSS JOIN LATERAL unnest(c.type) AS subject
JOIN public.tracks t ON t.name = subject
CROSS JOIN LATERAL unnest(c.assessments) AS assessment_mongo_id
JOIN public.exams e ON e.mongo_id = assessment_mongo_id
ON CONFLICT (track_id, item_type, item_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 4. Cascade-tag courses via competitions.courses → courses.mongo_id
--    Fallback path — catches any course whose own `category` array
--    is empty but is still linked from a tagged competition
-- ────────────────────────────────────────────────────────────

INSERT INTO public.track_items (track_id, item_type, item_id)
SELECT DISTINCT t.id, 'course', co.id
FROM public.competitions c
CROSS JOIN LATERAL unnest(c.type) AS subject
JOIN public.tracks t ON t.name = subject
CROSS JOIN LATERAL unnest(c.courses) AS course_mongo_id
JOIN public.courses co ON co.mongo_id = course_mongo_id
ON CONFLICT (track_id, item_type, item_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- VERIFY: count how many items landed in each track
-- ────────────────────────────────────────────────────────────

SELECT t.name AS track, ti.item_type, count(*) AS items
FROM public.track_items ti
JOIN public.tracks t ON t.id = ti.track_id
GROUP BY t.name, ti.item_type
ORDER BY t.name, ti.item_type;


-- ────────────────────────────────────────────────────────────
-- CHECK FOR GAPS: exams that still have no track at all
--    (competitions whose `assessments` array didn't match any
--    exams.mongo_id — these will need manual tagging)
-- ────────────────────────────────────────────────────────────

-- SELECT e.id, e.title, e.mongo_id
-- FROM public.exams e
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.track_items ti
--   WHERE ti.item_type = 'exam' AND ti.item_id = e.id
-- );
