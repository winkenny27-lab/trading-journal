-- ================================================================
-- TradeLog — Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ================================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  display_name text,
  plan        text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  timezone    text NOT NULL DEFAULT 'UTC',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trades
CREATE TABLE IF NOT EXISTS public.trades (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instrument       text NOT NULL,
  instrument_type  text NOT NULL CHECK (instrument_type IN ('forex_major','forex_exotic','index','stock')),
  direction        text NOT NULL CHECK (direction IN ('long','short')),
  entry_price      numeric(18,6) NOT NULL,
  stop_loss        numeric(18,6),
  take_profit      numeric(18,6),
  exit_price       numeric(18,6),
  lot_size         numeric(10,4),
  risk_amount      numeric(12,2),
  pnl              numeric(12,2),
  rr_ratio         numeric(6,2),
  result           text NOT NULL DEFAULT 'open' CHECK (result IN ('win','loss','breakeven','open')),
  entry_date       timestamptz NOT NULL,
  exit_date        timestamptz,
  reason_for_entry text,
  trade_narrative  text,
  exit_reason      text,
  emotional_state  text CHECK (emotional_state IN ('calm','confident','anxious','fearful','greedy','neutral','excited','frustrated')),
  screenshot_url   text,
  tags             text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trades_user_id_entry_date_idx ON public.trades(user_id, entry_date DESC);

-- Checklist templates
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Checklist items (belong to a template)
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  label       text NOT NULL,
  position    integer NOT NULL DEFAULT 0
);

-- Per-trade checklist responses (snapshot at trade time)
CREATE TABLE IF NOT EXISTS public.trade_checklist_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id    uuid NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.checklist_templates(id),
  item_label  text NOT NULL,
  checked     boolean NOT NULL DEFAULT false,
  position    integer NOT NULL DEFAULT 0
);

-- ================================================================
-- Row Level Security
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_checklist_responses ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist before recreating
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own trades" ON public.trades;
DROP POLICY IF EXISTS "Users manage own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users manage own checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Users manage own checklist responses" ON public.trade_checklist_responses;

-- Profiles: users can only access their own
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trades
CREATE POLICY "Users manage own trades" ON public.trades
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklist templates
CREATE POLICY "Users manage own templates" ON public.checklist_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklist items (via template ownership)
CREATE POLICY "Users manage own checklist items" ON public.checklist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t
      WHERE t.id = checklist_items.template_id AND t.user_id = auth.uid()
    )
  );

-- Trade checklist responses (via trade ownership)
CREATE POLICY "Users manage own checklist responses" ON public.trade_checklist_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trades tr
      WHERE tr.id = trade_checklist_responses.trade_id AND tr.user_id = auth.uid()
    )
  );
