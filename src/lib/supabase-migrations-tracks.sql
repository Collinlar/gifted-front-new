-- ============================================================
-- Gifted Platform — Tracks / Pathways System
-- Phase 1: Schema
-- Run in Supabase > SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. tracks TABLE
--    One row per subject pathway (Mathematics, English, ICT, etc.)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,   -- "Mathematics", "English", "ICT", "Science", "Literacy & Numeracy", "Technology"
  slug        TEXT UNIQUE NOT NULL,   -- "mathematics", "english", "ict" — used in /track/:slug routes
  description TEXT,
  icon        TEXT,                   -- icon name/key for the UI
  color       TEXT,                   -- accent color for the track card
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed the known tracks — adjust names/slugs to match your exact 6-7 tracks
INSERT INTO public.tracks (name, slug, sort_order) VALUES
  ('Mathematics',          'mathematics', 1),
  ('English',              'english',     2),
  ('Science',              'science',     3),
  ('ICT',                  'ict',         4),
  ('Technology',           'technology',  5),
  ('Literacy & Numeracy',  'literacy-numeracy', 6)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. track_items TABLE
--    Polymorphic join: tags any competition/course/exam/camp into a track.
--    item_type + item_id point at the existing tables — no foreign key
--    enforced (different source tables), so the app layer must keep it honest.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.track_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id   UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL CHECK (item_type IN ('competition', 'course', 'exam', 'camp')),
  item_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (track_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_track_items_lookup ON public.track_items (item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_track_items_track   ON public.track_items (track_id);


-- ────────────────────────────────────────────────────────────
-- 3. user_tracks TABLE
--    Which tracks a user has chosen — replaces the loose
--    purpose_of_registration string array with a real relation.
--    (We keep purpose_of_registration as-is for backward compatibility;
--    this table is additive and becomes the source of truth going forward.)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_tracks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id   UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, track_id)
);


-- ────────────────────────────────────────────────────────────
-- 4. RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.tracks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tracks" ON public.tracks;
CREATE POLICY "Public can read tracks"
  ON public.tracks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read track_items" ON public.track_items;
CREATE POLICY "Public can read track_items"
  ON public.track_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can read own track selections"   ON public.user_tracks;
DROP POLICY IF EXISTS "Users can insert own track selections" ON public.user_tracks;
DROP POLICY IF EXISTS "Users can delete own track selections" ON public.user_tracks;

CREATE POLICY "Users can read own track selections"
  ON public.user_tracks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own track selections"
  ON public.user_tracks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own track selections"
  ON public.user_tracks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass for all three (admin tooling, tagging scripts)
DROP POLICY IF EXISTS "Service role full access tracks"      ON public.tracks;
DROP POLICY IF EXISTS "Service role full access track_items" ON public.track_items;
DROP POLICY IF EXISTS "Service role full access user_tracks" ON public.user_tracks;

CREATE POLICY "Service role full access tracks"
  ON public.tracks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access track_items"
  ON public.track_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access user_tracks"
  ON public.user_tracks FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 5. INSPECTION QUERY (run separately, not part of the migration)
--    Shows the distinct category/type values currently in use across
--    competitions, courses, and exams — needed to write the Phase 2
--    tagging INSERTs that map existing rows into tracks.
-- ────────────────────────────────────────────────────────────

-- SELECT 'competitions' AS source, type AS category, count(*) FROM public.competitions GROUP BY type
-- UNION ALL
-- SELECT 'courses' AS source, category, count(*) FROM public.courses GROUP BY category
-- UNION ALL
-- SELECT 'exams' AS source, category, count(*) FROM public.exams GROUP BY category
-- ORDER BY source, category;
