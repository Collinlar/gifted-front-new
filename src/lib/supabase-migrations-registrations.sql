-- ============================================================
-- Gifted Platform — Registration system improvements
-- Run in Supabase > SQL Editor
-- ============================================================

-- Add competition_id FK to program_registrations so new registrations
-- from TrackDetail can be linked back to the competitions table.
ALTER TABLE public.program_registrations
  ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL;

-- Ensure user_id is indexed for fast per-user history lookups.
CREATE INDEX IF NOT EXISTS idx_program_registrations_user_id ON public.program_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_camp_registrations_user_id    ON public.camp_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id           ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id       ON public.course_progress(user_id);
