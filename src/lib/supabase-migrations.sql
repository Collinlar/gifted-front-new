-- ============================================================
-- Gifted Platform — Migration Part 2
-- Add user_id columns to tables that were migrated without them
-- Run this in Supabase > SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ADD user_id TO exam_scores
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.exam_scores
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own scores"          ON public.exam_scores;
DROP POLICY IF EXISTS "Users can insert own scores"        ON public.exam_scores;
DROP POLICY IF EXISTS "Service role full access on scores" ON public.exam_scores;

CREATE POLICY "Users can read own scores"
  ON public.exam_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.exam_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on scores"
  ON public.exam_scores FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 2. ADD user_id TO program_registrations
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.program_registrations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.program_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own registrations"          ON public.program_registrations;
DROP POLICY IF EXISTS "Users can insert own registrations"        ON public.program_registrations;
DROP POLICY IF EXISTS "Service role full access on registrations" ON public.program_registrations;

-- Allow read if user_id matches OR full_name matches (for legacy rows migrated without user_id)
CREATE POLICY "Users can read own registrations"
  ON public.program_registrations FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
  );

CREATE POLICY "Users can insert own registrations"
  ON public.program_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on registrations"
  ON public.program_registrations FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 3. ADD user_id TO transactions
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transactions"          ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions"        ON public.transactions;
DROP POLICY IF EXISTS "Service role full access on transactions" ON public.transactions;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on transactions"
  ON public.transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- VERIFY: confirm user_id columns were added
-- ────────────────────────────────────────────────────────────
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('exam_scores', 'program_registrations', 'transactions')
--   AND column_name = 'user_id';
