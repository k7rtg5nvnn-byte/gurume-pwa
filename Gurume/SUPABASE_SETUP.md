# 🔧 SUPABASE KURULUM REHBERİ

## 1️⃣ SUPABASE PROJESİ OLUŞTUR

1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" butonuna tıkla
3. Yeni bir proje oluştur:
   - Organization: Kendi org'unu seç
   - Name: `gurume-app` (veya istediğin isim)
   - Database Password: Güçlü bir şifre oluştur (SAKLA!)
   - Region: `Europe West (Frankfurt)` veya en yakın bölge
   - Pricing Plan: Free tier yeterli

## 2️⃣ API AYARLARI

Proje oluştuktan sonra:

1. Sol menüden **Settings > API** bölümüne git
2. Şu bilgileri kopyala:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJI...` (uzun bir token)

## 3️⃣ .ENV DOSYASINI GÜNCELLE

`/workspace/Gurume/.env` dosyasını aç ve şu değerleri değiştir:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://SENIN-PROJE-URL.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SENIN-ANON-KEY-BURAYA
```

## 4️⃣ STORAGE BUCKET'LARI OLUŞTUR

Supabase dashboard'da **Storage** bölümüne git ve şu bucket'ları oluştur:

### Bucket 1: `avatars`
- Name: `avatars`
- Public: ✅ **Evet** (herkese açık)
- File size limit: 2 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### Bucket 2: `route-images`
- Name: `route-images`
- Public: ✅ **Evet** (herkese açık)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### Bucket 3: `place-images`
- Name: `place-images`
- Public: ✅ **Evet** (herkese açık)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### Bucket 4: `review-images`
- Name: `review-images`
- Public: ✅ **Evet** (herkese açık)
- File size limit: 3 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

## 5️⃣ VERİTABANI TABLOLARI OLUŞTUR

Supabase dashboard'da **SQL Editor** bölümüne git ve şu SQL'i çalıştır:

```sql
-- Users (extend Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  instagram_handle TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  total_routes INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_route_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Routes
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  city_id TEXT NOT NULL,
  district_ids TEXT[] DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  duration_minutes INTEGER NOT NULL,
  distance_km DECIMAL(6,2) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  budget_range TEXT CHECK (budget_range IN ('budget', 'moderate', 'luxury')),
  tags TEXT[] DEFAULT '{}',
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Policies for routes
CREATE POLICY "Published routes are viewable by everyone" 
  ON public.routes FOR SELECT 
  USING (is_published = TRUE OR auth.uid() = author_id);

CREATE POLICY "Users can create routes" 
  ON public.routes FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own routes" 
  ON public.routes FOR UPDATE 
  USING (auth.uid() = author_id);

-- Route Stops
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  place_id TEXT,
  highlight TEXT NOT NULL,
  notes TEXT,
  dwell_minutes INTEGER DEFAULT 30,
  arrival_time TIME,
  transport_mode TEXT CHECK (transport_mode IN ('walking', 'driving', 'transit', 'cycling')),
  tasting_notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for route_stops
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- Policies for route_stops
CREATE POLICY "Route stops are viewable by everyone" 
  ON public.route_stops FOR SELECT 
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_routes_city ON public.routes(city_id);
CREATE INDEX IF NOT EXISTS idx_routes_author ON public.routes(author_id);
CREATE INDEX IF NOT EXISTS idx_routes_rating ON public.routes(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);
```

## 6️⃣ UYGULAMAYI YENİDEN BAŞLAT

```bash
cd /workspace/Gurume
rm -rf node_modules/.cache .expo
npx expo start --clear
```

## ✅ TEST ET

1. Uygulamayı aç
2. Kayıt ol / Giriş yap
3. Profil fotoğrafı yüklemeyi dene
4. Rota oluştur ve görsel ekle

---

## 🆘 SORUN GİDERME

### "Invalid API key" hatası
- `.env` dosyasındaki `EXPO_PUBLIC_SUPABASE_ANON_KEY` doğru mu kontrol et
- Expo'yu yeniden başlat: `npx expo start --clear`

### "Bucket not found" hatası
- Supabase Storage'da bucket'ları oluşturdun mu kontrol et
- Bucket isimleri tam olarak şu şekilde olmalı: `avatars`, `route-images`, `place-images`, `review-images`

### "Permission denied" hatası
- Bucket'ları **Public** (herkese açık) olarak işaretledin mi kontrol et
- RLS (Row Level Security) politikalarını SQL ile doğru oluşturdun mu kontrol et

### Görsel yüklenmiyor
- Mobilde: Galeri izni verildi mi kontrol et
- Web'de: HTTPS kullanıyor musun kontrol et (HTTP'de çalışmaz)
