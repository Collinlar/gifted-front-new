-- ============================================================
-- Gifted Platform — Tracks / Pathways System
-- Phase 3: Camps (new feature) + track tagging hook
-- Run in Supabase > SQL Editor (after Phase 1 + 2)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. camps TABLE
--    Scheduled events, same shape as competitions (dates, cost,
--    subject tags) so the UI patterns can be reused directly.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.camps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  start_date   TEXT,                 -- matches competitions' text-based date storage
  end_date     TEXT,
  location     TEXT,                 -- physical address or virtual meeting link
  is_virtual   BOOLEAN DEFAULT FALSE,
  cost         NUMERIC DEFAULT 0,
  capacity     INTEGER,              -- max attendees, NULL = unlimited
  type         TEXT[] DEFAULT '{}',  -- subject tags — same vocabulary as competitions.type
                                      -- (Mathematics, Science, ICT, Geography, etc.)
  image        TEXT,
  link         TEXT,                 -- external info/registration link if any
  publish      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 2. camp_registrations TABLE
--    Proper join table (not an array column) so registrations
--    are queryable per-user and per-camp without cascading writes.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.camp_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id     UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'registered', -- registered | waitlisted | cancelled | attended
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (camp_id, user_id)
);


-- ────────────────────────────────────────────────────────────
-- 3. RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.camps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published camps" ON public.camps;
CREATE POLICY "Public can read published camps"
  ON public.camps FOR SELECT TO anon, authenticated
  USING (publish = true);

DROP POLICY IF EXISTS "Service role full access camps" ON public.camps;
CREATE POLICY "Service role full access camps"
  ON public.camps FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own camp registrations"   ON public.camp_registrations;
DROP POLICY IF EXISTS "Users can insert own camp registrations" ON public.camp_registrations;
DROP POLICY IF EXISTS "Service role full access camp_registrations" ON public.camp_registrations;

CREATE POLICY "Users can read own camp registrations"
  ON public.camp_registrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own camp registrations"
  ON public.camp_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access camp_registrations"
  ON public.camp_registrations FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 4. Tag camps into tracks (re-runnable — safe to call again
--    any time new camps are added with a `type` array set)
-- ────────────────────────────────────────────────────────────

INSERT INTO public.track_items (track_id, item_type, item_id)
SELECT DISTINCT t.id, 'camp', cm.id
FROM public.camps cm
CROSS JOIN LATERAL unnest(cm.type) AS subject
JOIN public.tracks t ON t.name = subject
ON CONFLICT (track_id, item_type, item_id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 5. Seed: no camps yet — table is empty until you add real data
--    Example insert for reference when you're ready to add one:
-- ────────────────────────────────────────────────────────────

-- INSERT INTO public.camps (name, description, start_date, end_date, location, is_virtual, cost, capacity, type, publish)
-- VALUES (
--   'Summer Math Bootcamp 2026',
--   'A 5-day intensive camp covering algebra, geometry, and competition problem-solving.',
--   'Jul 6, 2026', 'Jul 10, 2026',
--   'Accra International School', false,
--   500, 30,
--   ARRAY['Mathematics'],
--   true
-- );
