-- ============================================================
-- exam_scores v2 — add display columns for contest leaderboard
-- Current columns: id, mongo_id, quiz_id, grade, score, created_at, updated_at, user_id
-- Run in Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.exam_scores
  ADD COLUMN IF NOT EXISTS user_name  TEXT,
  ADD COLUMN IF NOT EXISTS time_taken INTEGER,   -- seconds taken to complete contest
  ADD COLUMN IF NOT EXISTS achievement JSONB;    -- { title, icon } badge data
