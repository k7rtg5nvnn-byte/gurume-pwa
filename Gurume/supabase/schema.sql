-- GURUME SUPABASE DATABASE SCHEMA
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'dan çalıştırın
-- Her tablo için Row Level Security (RLS) etkinleştirildi

-- ============= USERS & PROFILES =============

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  total_routes INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_route_rating DECIMAL(3,2) DEFAULT 0.0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  favorite_route_ids UUID[] DEFAULT '{}',
  favorite_city_ids TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',
  budget_preference TEXT CHECK (budget_preference IN ('budget', 'moderate', 'premium', 'any')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============= CITIES & DISTRICTS =============

CREATE TABLE IF NOT EXISTS public.cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_image TEXT,
  highlight_tags TEXT[] DEFAULT '{}',
  signature_dishes TEXT[] DEFAULT '{}',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- ============= PLACES & VENUES =============

CREATE TABLE IF NOT EXISTS public.places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
  district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  specialties TEXT[] DEFAULT '{}',
  speed_score DECIMAL(2,1) CHECK (speed_score >= 0 AND speed_score <= 5),
  cleanliness_score DECIMAL(2,1) CHECK (cleanliness_score >= 0 AND cleanliness_score <= 5),
  value_score DECIMAL(2,1) CHECK (value_score >= 0 AND value_score <= 5),
  price_level TEXT CHECK (price_level IN ('₺', '₺₺', '₺₺₺')),
  hero_image TEXT,
  images TEXT[] DEFAULT '{}',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  phone_number TEXT,
  opening_hours TEXT,
  website TEXT,
  instagram_handle TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= ROUTES & JOURNEYS =============

CREATE TABLE IF NOT EXISTS public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
  district_ids TEXT[] DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  duration_minutes INTEGER,
  distance_km DECIMAL(6,2),
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  budget_range TEXT CHECK (budget_range IN ('budget', 'moderate', 'premium')),
  best_time_to_visit TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  tasting_notes TEXT[] DEFAULT '{}',
  highlight TEXT,
  dwell_minutes INTEGER,
  arrival_time TEXT,
  transport_mode TEXT CHECK (transport_mode IN ('walking', 'driving', 'public_transport', 'bike')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= RATINGS & REVIEWS =============

CREATE TABLE IF NOT EXISTS public.route_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  visited_at DATE,
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, user_id)
);

-- ============= IMAGES & UPLOADS =============

CREATE TABLE IF NOT EXISTS public.image_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= INTERACTIONS =============

CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS public.route_saves (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, route_id)
);

-- ============= INDEXES =============

CREATE INDEX idx_routes_author ON public.routes(author_id);
CREATE INDEX idx_routes_city ON public.routes(city_id);
CREATE INDEX idx_routes_rating ON public.routes(average_rating DESC);
CREATE INDEX idx_routes_published ON public.routes(is_published, published_at DESC);
CREATE INDEX idx_places_city ON public.places(city_id);
CREATE INDEX idx_places_district ON public.places(district_id);
CREATE INDEX idx_route_ratings_route ON public.route_ratings(route_id);
CREATE INDEX idx_route_ratings_user ON public.route_ratings(user_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_route_saves_user ON public.route_saves(user_id);
CREATE INDEX idx_districts_city ON public.districts(city_id);

-- ============= ROW LEVEL SECURITY (RLS) =============

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_saves ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Preferences are viewable by owner" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Cities & Districts policies (public read)
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Districts are viewable by everyone" ON public.districts FOR SELECT USING (true);

-- Places policies
CREATE POLICY "Places are viewable by everyone" ON public.places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert places" ON public.places FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Routes policies
CREATE POLICY "Published routes are viewable by everyone" ON public.routes FOR SELECT USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "Users can insert own routes" ON public.routes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own routes" ON public.routes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own routes" ON public.routes FOR DELETE USING (auth.uid() = author_id);

-- Route stops policies
CREATE POLICY "Route stops are viewable by everyone" ON public.route_stops FOR SELECT USING (true);
CREATE POLICY "Route owners can manage stops" ON public.route_stops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND author_id = auth.uid())
);

-- Route ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON public.route_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON public.route_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.route_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON public.route_ratings FOR DELETE USING (auth.uid() = user_id);

-- Image uploads policies
CREATE POLICY "Users can view own images" ON public.image_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload images" ON public.image_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- Route saves policies
CREATE POLICY "Saves are viewable by owner" ON public.route_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saves" ON public.route_saves FOR ALL USING (auth.uid() = user_id);

-- ============= FUNCTIONS & TRIGGERS =============

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_ratings_updated_at BEFORE UPDATE ON public.route_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NOW()
  );
  
  INSERT INTO public.user_preferences (user_id, created_at)
  VALUES (NEW.id, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update route rating stats
CREATE OR REPLACE FUNCTION public.update_route_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.routes
  SET 
    average_rating = (
      SELECT COALESCE(AVG(score), 0)
      FROM public.route_ratings
      WHERE route_id = COALESCE(NEW.route_id, OLD.route_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.route_ratings
      WHERE route_id = COALESCE(NEW.route_id, OLD.route_id)
    )
  WHERE id = COALESCE(NEW.route_id, OLD.route_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for route rating updates
CREATE TRIGGER on_route_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.route_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_route_rating_stats();

-- Function to update follow counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for follow count updates
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- ============= STORAGE BUCKETS =============
-- Bu kısmı Supabase Dashboard > Storage'dan manuel oluşturun:
-- 1. 'avatars' bucket (public)
-- 2. 'route-images' bucket (public)
-- 3. 'place-images' bucket (public)
-- 4. 'review-images' bucket (public)
