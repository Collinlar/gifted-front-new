-- ============================================================
-- Gifted Platform — Tracks / Pathways System
-- Phase 2 Refinement: fix over-broad exam tagging
--
-- Problem: exams inherit ALL subjects from the competition that
-- lists them. A multi-subject competition (e.g. Ghana STEM
-- Olympiad, type = Science+Mathematics) bundles exams covering
-- different sub-topics — so an exam titled "STEM and Geography
-- for all Grades" incorrectly inherited the Mathematics tag.
--
-- Fix: if an exam's own title clearly names a different specific
-- subject than the track, and doesn't name this track's subject,
-- drop that tag. Generic titles with no subject keyword (e.g.
-- "GH STEM Olympiad Trial [Grade 7]") are left alone — they have
-- no signal to contradict the inherited tag, so multi-tagging
-- them across Science+Mathematics is reasonable.
-- ============================================================

WITH keywords (track_name, keyword) AS (
  VALUES
    ('Mathematics', 'math'),
    ('Science',     'science'),
    ('ICT',         'ict'),
    ('Geography',   'geograph'),
    ('English',     'english'),
    ('Technology',  'technology')
)
DELETE FROM public.track_items ti
USING public.exams e, public.tracks t, keywords k_other, keywords k_mine
WHERE ti.item_type   = 'exam'
  AND ti.item_id     = e.id
  AND ti.track_id    = t.id
  AND k_mine.track_name  = t.name
  AND k_other.track_name <> t.name
  AND e.title ILIKE '%' || k_other.keyword || '%'
  AND e.title NOT ILIKE '%' || k_mine.keyword || '%';


-- ────────────────────────────────────────────────────────────
-- VERIFY: re-check counts per track after cleanup
-- ────────────────────────────────────────────────────────────

SELECT t.name AS track, ti.item_type, count(*) AS items
FROM public.track_items ti
JOIN public.tracks t ON t.id = ti.track_id
GROUP BY t.name, ti.item_type
ORDER BY t.name, ti.item_type;


-- ────────────────────────────────────────────────────────────
-- NOTE FOR FUTURE RE-RUNS OF PHASE 2
-- The original exam cascade INSERT (Phase 2, step 3) will
-- re-introduce this exact bug if you re-run it after adding new
-- competitions/exams. Use this replacement version instead —
-- it encodes the same title-based exclusion at insert time so
-- the bad tag never gets created in the first place:
-- ────────────────────────────────────────────────────────────

-- WITH keywords (track_name, keyword) AS (
--   VALUES
--     ('Mathematics', 'math'), ('Science', 'science'), ('ICT', 'ict'),
--     ('Geography', 'geograph'), ('English', 'english'), ('Technology', 'technology')
-- )
-- INSERT INTO public.track_items (track_id, item_type, item_id)
-- SELECT DISTINCT t.id, 'exam', e.id
-- FROM public.competitions c
-- CROSS JOIN LATERAL unnest(c.type) AS subject
-- JOIN public.tracks t ON t.name = subject
-- CROSS JOIN LATERAL unnest(c.assessments) AS assessment_mongo_id
-- JOIN public.exams e ON e.mongo_id = assessment_mongo_id
-- WHERE NOT EXISTS (
--   -- exclude if the exam title names a different specific subject
--   -- than this track, and doesn't name this track's own subject
--   SELECT 1 FROM keywords k_other, keywords k_mine
--   WHERE k_mine.track_name = t.name
--     AND k_other.track_name <> t.name
--     AND e.title ILIKE '%' || k_other.keyword || '%'
--     AND e.title NOT ILIKE '%' || k_mine.keyword || '%'
-- )
-- ON CONFLICT (track_id, item_type, item_id) DO NOTHING;
