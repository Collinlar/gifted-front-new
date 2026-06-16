-- ============================================================
-- Gifted Platform — "New exam" detection
-- Run in Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_seen_exams_at TIMESTAMPTZ;

-- No backfill needed — NULL means "never looked," so every existing
-- exam will correctly show as new the first time each user opens a
-- track's Assessments tab after this migration runs.
