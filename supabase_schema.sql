-- ============================================================================
-- TREASURE HUNT PERKADERAN (TMD) — SUPABASE POSTGRESQL SCHEMA & REALTIME SETUP
-- ============================================================================
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL TEAMS (KELOMPOK)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  division_title TEXT NOT NULL DEFAULT '',
  color_name TEXT NOT NULL DEFAULT 'Merah',
  accent_hex TEXT NOT NULL DEFAULT '#FF1744',
  route_code TEXT NOT NULL DEFAULT 'Rute A',
  hero_first TEXT NOT NULL DEFAULT 'SQUAD',
  hero_second TEXT NOT NULL DEFAULT 'ALPHA',
  image_url TEXT NOT NULL DEFAULT '',
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  last_seen_at TIMESTAMPTZ
);

-- 2. TABEL CHECKPOINTS (POS)
CREATE TABLE IF NOT EXISTS public.checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pos_number INT NOT NULL,
  title TEXT NOT NULL,
  category_label TEXT NOT NULL DEFAULT '',
  xp_reward INT NOT NULL DEFAULT 150,
  lat DOUBLE PRECISION NOT NULL DEFAULT -6.200000,
  lng DOUBLE PRECISION NOT NULL DEFAULT 106.816666,
  is_convergence BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3. TABEL QUESTIONS (SOAL PILIHAN GANDA)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkpoint_id UUID NOT NULL REFERENCES public.checkpoints(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- NULL jika soal berlaku untuk semua kelompok
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D'))
);

-- 4. TABEL ROUTE_CLUES (PASSWORD/TOKEN & CLUE RUTE PER TIM PER POS)
CREATE TABLE IF NOT EXISTS public.route_clues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkpoint_id UUID NOT NULL REFERENCES public.checkpoints(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  next_clue_text TEXT NOT NULL DEFAULT '',
  distance_label TEXT NOT NULL DEFAULT '~100M',
  UNIQUE (checkpoint_id, team_id)
);

-- 5. TABEL TEAM_PROGRESS (PROGRES PENGERJAAN PER TIM PER POS)
CREATE TABLE IF NOT EXISTS public.team_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES public.checkpoints(id) ON DELETE CASCADE,
  token_verified BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_solved BOOLEAN NOT NULL DEFAULT FALSE,
  selected_option CHAR(1),
  verified_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  UNIQUE (team_id, checkpoint_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — AKSES PUBLIK UNTUK PESERTA & PANITIA DI LAPANGAN
-- ============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access teams" ON public.teams;
CREATE POLICY "Public access teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access checkpoints" ON public.checkpoints;
CREATE POLICY "Public access checkpoints" ON public.checkpoints FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access questions" ON public.questions;
CREATE POLICY "Public access questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access route_clues" ON public.route_clues;
CREATE POLICY "Public access route_clues" ON public.route_clues FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access team_progress" ON public.team_progress;
CREATE POLICY "Public access team_progress" ON public.team_progress FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- HAK AKSES (GRANT) UNTUK ROLE ANON & AUTHENTICATED
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE
  public.teams,
  public.checkpoints,
  public.questions,
  public.route_clues,
  public.team_progress
TO anon, authenticated;

-- ============================================================================
-- AKTIFKAN SUPABASE REALTIME UNTUK SINKRONISASI LIVE ANTAR-HP
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.teams,
  public.checkpoints,
  public.questions,
  public.route_clues,
  public.team_progress;
