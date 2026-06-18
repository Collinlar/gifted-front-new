-- ============================================================
-- Practice Mode Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add mode to exams table
--    mode: 'exam'     = structured assessment, strict conditions
--         'practice' = adaptive practice with feedback and hints
--         'both'     = content serves both modes
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'exam'
    CHECK (mode IN ('exam', 'practice', 'both'));

-- Link a practice module to the exam it prepares for
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS practice_for UUID REFERENCES exams(id) ON DELETE SET NULL;

-- ============================================================
-- 2. question_mastery
--    One row per user per question per exam.
--    Tracks correctness history and computes when to resurface
--    the question based on spacing intervals.
-- ============================================================
CREATE TABLE IF NOT EXISTS question_mastery (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id        UUID        NOT NULL REFERENCES exams(id)      ON DELETE CASCADE,
  question_id    TEXT        NOT NULL,   -- question's id field within the JSONB array
  correct_count  INT         NOT NULL DEFAULT 0,
  attempt_count  INT         NOT NULL DEFAULT 0,
  -- mastery_score: 0.0 (never seen / always wrong) → 1.0 (consistently correct)
  mastery_score  FLOAT       NOT NULL DEFAULT 0.0,
  -- next_review: spacing — when this question should next appear in a session
  next_review    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, exam_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_mastery_user_exam
  ON question_mastery (user_id, exam_id);

CREATE INDEX IF NOT EXISTS idx_question_mastery_next_review
  ON question_mastery (user_id, next_review);

-- ============================================================
-- 3. practice_sessions
--    One row per completed practice session.
--    Used for the mastery dashboard and session history.
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_sessions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id        UUID        NOT NULL REFERENCES exams(id)      ON DELETE CASCADE,
  questions_seen INT         NOT NULL DEFAULT 0,
  correct_count  INT         NOT NULL DEFAULT 0,
  -- session_score: average mastery score across all questions seen in this session
  session_score  FLOAT       NOT NULL DEFAULT 0.0,
  hints_used     INT         NOT NULL DEFAULT 0,
  duration_secs  INT,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_exam
  ON practice_sessions (user_id, exam_id, completed_at DESC);

-- ============================================================
-- 4. RLS policies (enable if RLS is on for your project)
-- ============================================================

-- question_mastery: users can only read/write their own rows
ALTER TABLE question_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_mastery_user_select" ON question_mastery;
CREATE POLICY "question_mastery_user_select"
  ON question_mastery FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "question_mastery_user_insert" ON question_mastery;
CREATE POLICY "question_mastery_user_insert"
  ON question_mastery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "question_mastery_user_update" ON question_mastery;
CREATE POLICY "question_mastery_user_update"
  ON question_mastery FOR UPDATE
  USING (auth.uid() = user_id);

-- practice_sessions: users can only read/write their own rows
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "practice_sessions_user_select" ON practice_sessions;
CREATE POLICY "practice_sessions_user_select"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "practice_sessions_user_insert" ON practice_sessions;
CREATE POLICY "practice_sessions_user_insert"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. Helper: updated_at trigger for question_mastery
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS question_mastery_updated_at ON question_mastery;
CREATE TRIGGER question_mastery_updated_at
  BEFORE UPDATE ON question_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
