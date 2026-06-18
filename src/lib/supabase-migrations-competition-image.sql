-- ============================================================
-- Gifted Platform — Add image column to competitions table
-- Run in Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS image TEXT;
