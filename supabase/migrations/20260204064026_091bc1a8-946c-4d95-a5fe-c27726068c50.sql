
-- =============================================
-- GAMES ARENA EXPANSION - Complete Schema
-- =============================================

-- 1. SPIN WHEELS TABLE
CREATE TABLE public.spin_wheels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  cost_per_spin INTEGER DEFAULT 0,
  daily_spin_limit INTEGER DEFAULT 3,
  total_spins_allowed INTEGER,
  banner_image TEXT,
  theme_color TEXT DEFAULT '#F97316',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- 2. SPIN WHEEL SEGMENTS TABLE
CREATE TABLE public.spin_wheel_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wheel_id UUID NOT NULL REFERENCES public.spin_wheels(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  prize_type TEXT NOT NULL DEFAULT 'coins', -- coins, coupon, nothing, jackpot
  prize_value INTEGER DEFAULT 0,
  probability_weight INTEGER DEFAULT 1,
  color TEXT NOT NULL,
  icon TEXT,
  is_jackpot BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- 3. SPIN RESULTS TABLE
CREATE TABLE public.spin_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  wheel_id UUID NOT NULL REFERENCES public.spin_wheels(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES public.spin_wheel_segments(id),
  prize_type TEXT NOT NULL,
  prize_value INTEGER DEFAULT 0,
  is_jackpot BOOLEAN DEFAULT false,
  spun_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. LUCKY DRAWS TABLE
CREATE TABLE public.lucky_draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  draw_type TEXT DEFAULT 'random', -- random, weighted
  status TEXT DEFAULT 'upcoming', -- upcoming, live, completed
  max_entries INTEGER,
  entry_cost INTEGER DEFAULT 0,
  scheduled_draw_at TIMESTAMP WITH TIME ZONE,
  drawn_at TIMESTAMP WITH TIME ZONE,
  winner_count INTEGER DEFAULT 1,
  verification_hash TEXT,
  prizes JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT true,
  banner_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. LUCKY DRAW ENTRIES TABLE
CREATE TABLE public.lucky_draw_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID NOT NULL REFERENCES public.lucky_draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  entry_count INTEGER DEFAULT 1,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draw_id, user_id)
);

-- 6. LUCKY DRAW WINNERS TABLE
CREATE TABLE public.lucky_draw_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID NOT NULL REFERENCES public.lucky_draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  prize_rank INTEGER DEFAULT 1,
  prize_details JSONB,
  verification_seed TEXT,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. IPL PLAYERS TABLE
CREATE TABLE public.ipl_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Batsman, Bowler, All-rounder, Wicket-keeper
  team_name TEXT,
  nationality TEXT NOT NULL,
  photo_url TEXT,
  base_price BIGINT DEFAULT 2000000, -- 20 Lakhs default
  category TEXT DEFAULT 'Silver', -- Platinum, Gold, Silver, Bronze
  stats JSONB DEFAULT '{}'::jsonb,
  ipl_team_history TEXT[],
  age INTEGER,
  is_uncapped BOOLEAN DEFAULT false,
  is_overseas BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. IPL AUCTIONS TABLE
CREATE TABLE public.ipl_auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  season_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'lobby', -- lobby, active, paused, completed
  initial_budget BIGINT DEFAULT 8500000000, -- 85 Cr
  min_team_size INTEGER DEFAULT 11,
  max_team_size INTEGER DEFAULT 25,
  max_overseas INTEGER DEFAULT 8,
  bid_increment BIGINT DEFAULT 500000, -- 5 Lakhs
  time_per_player INTEGER DEFAULT 30,
  current_player_id UUID REFERENCES public.ipl_players(id),
  current_bid BIGINT,
  current_bidder_id UUID,
  is_public BOOLEAN DEFAULT true,
  max_teams INTEGER DEFAULT 10,
  join_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. AUCTION TEAMS TABLE
CREATE TABLE public.auction_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.ipl_auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  team_name TEXT NOT NULL,
  team_logo TEXT,
  remaining_budget BIGINT NOT NULL,
  players_count INTEGER DEFAULT 0,
  overseas_count INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(auction_id, user_id)
);

-- 10. AUCTION BIDS TABLE
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.ipl_auctions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.ipl_players(id),
  team_id UUID NOT NULL REFERENCES public.auction_teams(id) ON DELETE CASCADE,
  bid_amount BIGINT NOT NULL,
  bid_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. AUCTION SOLD PLAYERS TABLE
CREATE TABLE public.auction_sold_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.ipl_auctions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.ipl_players(id),
  team_id UUID NOT NULL REFERENCES public.auction_teams(id) ON DELETE CASCADE,
  sold_price BIGINT NOT NULL,
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(auction_id, player_id)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.spin_wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draw_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipl_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_sold_players ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Spin Wheels - Public read, admin/creator write
CREATE POLICY "Public can view active spin wheels" ON public.spin_wheels
  FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Creators can manage their wheels" ON public.spin_wheels
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all wheels" ON public.spin_wheels
  FOR ALL USING (public.is_admin());

-- Spin Wheel Segments - Read with wheel access
CREATE POLICY "Public can view segments of active wheels" ON public.spin_wheel_segments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.spin_wheels WHERE id = wheel_id AND is_active = true AND is_public = true)
  );

CREATE POLICY "Admins can manage segments" ON public.spin_wheel_segments
  FOR ALL USING (public.is_admin());

-- Spin Results - Users see own, admins see all
CREATE POLICY "Users can view own spin results" ON public.spin_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spin results" ON public.spin_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all spin results" ON public.spin_results
  FOR SELECT USING (public.is_admin());

-- Lucky Draws - Public read active, creator/admin write
CREATE POLICY "Public can view public draws" ON public.lucky_draws
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their draws" ON public.lucky_draws
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all draws" ON public.lucky_draws
  FOR ALL USING (public.is_admin());

-- Lucky Draw Entries - Users manage own
CREATE POLICY "Users can view own entries" ON public.lucky_draw_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enter draws" ON public.lucky_draw_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" ON public.lucky_draw_entries
  FOR SELECT USING (public.is_admin());

-- Lucky Draw Winners - Public read
CREATE POLICY "Anyone can view winners" ON public.lucky_draw_winners
  FOR SELECT USING (true);

CREATE POLICY "System can insert winners" ON public.lucky_draw_winners
  FOR INSERT WITH CHECK (public.is_admin());

-- IPL Players - Public read
CREATE POLICY "Anyone can view players" ON public.ipl_players
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage players" ON public.ipl_players
  FOR ALL USING (public.is_admin());

-- IPL Auctions - Public read, creator/admin write
CREATE POLICY "Anyone can view public auctions" ON public.ipl_auctions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can manage their auctions" ON public.ipl_auctions
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all auctions" ON public.ipl_auctions
  FOR ALL USING (public.is_admin());

-- Auction Teams - Participants can manage own
CREATE POLICY "Anyone can view teams in public auctions" ON public.auction_teams
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ipl_auctions WHERE id = auction_id AND is_public = true)
  );

CREATE POLICY "Users can manage own team" ON public.auction_teams
  FOR ALL USING (auth.uid() = user_id);

-- Auction Bids - Visible to auction participants
CREATE POLICY "Participants can view bids" ON public.auction_bids
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.auction_teams WHERE auction_id = auction_bids.auction_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.ipl_auctions WHERE id = auction_id AND created_by = auth.uid())
  );

CREATE POLICY "Participants can place bids" ON public.auction_bids
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.auction_teams WHERE id = team_id AND user_id = auth.uid())
  );

-- Auction Sold Players - Public read
CREATE POLICY "Anyone can view sold players" ON public.auction_sold_players
  FOR SELECT USING (true);

CREATE POLICY "System can record sales" ON public.auction_sold_players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.ipl_auctions WHERE id = auction_id AND created_by = auth.uid())
    OR public.is_admin()
  );

-- =============================================
-- ENABLE REALTIME FOR AUCTION BIDS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ipl_auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_teams;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to generate auction join code
CREATE OR REPLACE FUNCTION public.generate_auction_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate auction join code
CREATE OR REPLACE FUNCTION public.set_auction_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
    LOOP
      new_code := public.generate_auction_code();
      SELECT EXISTS(SELECT 1 FROM public.ipl_auctions WHERE join_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.join_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_auction_code_trigger
  BEFORE INSERT ON public.ipl_auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auction_code();

-- Update timestamp trigger for lucky_draws
CREATE TRIGGER update_lucky_draws_updated_at
  BEFORE UPDATE ON public.lucky_draws
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
