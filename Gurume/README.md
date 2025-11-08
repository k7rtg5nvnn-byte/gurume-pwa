# 🍽️ GURUME - Türkiye Lezzet Rotaları Uygulaması

> **Türkiye'yi lezzet rotalarıyla keşfet.** iOS ve Android için tam özellikli sosyal rota paylaşım uygulaması.

---

## 📱 UYGULAMA ÖZELLİKLERİ

### ✅ Tamamlanmış Özellikler

#### 🔐 Kullanıcı Yönetimi
- Email & Password ile kayıt/giriş
- Kullanıcı profili (avatar, bio, Instagram)
- Profil düzenleme
- Session yönetimi (auto-refresh)

#### 🗺️ Rota Yönetimi
- **Rota Oluşturma** (3 aşamalı form):
  - Temel bilgiler + 81 il seçimi
  - Duraklar ekleme & düzenleme
  - Görsel yükleme (kapak + ek görseller)
- **Rota Görüntüleme**:
  - Puana göre sıralı liste
  - Detaylı rota bilgileri
  - Duraklar ve mekan detayları
- **Rota Değerlendirme**:
  - 5 yıldız rating sistemi
  - Yorum yazma
  - Fotoğraf ekleme

#### 🔍 Keşfet & Ara
- Gelişmiş arama
- Şehir filtreleme (81 il)
- Puan filtreleme (3+, 4+, 4.5+)
- Sıralama seçenekleri:
  - Puana göre
  - Popülerliğe göre
  - Yeniliğe göre

#### 🎨 Tasarım
- **Turuncu, Kırmızı, Sarı** tonlarında modern UI
- Light & Dark mode desteği
- Responsive tasarım
- Beautiful animations

#### 🏗️ Teknik Altyapı
- **Supabase** backend (PostgreSQL)
- Row Level Security (RLS)
- Image upload (Supabase Storage)
- Real-time data syncing
- TypeScript strict mode
- ESLint ile kod kalitesi

---

## 🚀 KURULUM & ÇALIŞTIRMA

### 1. Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- iOS Simulator (Mac) veya Android Emulator

### 2. Dependency Kurulumu

```bash
cd Gurume
npm install
```

### 3. Supabase Yapılandırması

#### a) Supabase Projesi Oluştur
1. [supabase.com](https://supabase.com) → "New Project"
2. Project URL ve anon key'i kaydet

#### b) Environment Variables
`.env` dosyasını düzenle:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### c) Database Şemasını Yükle
1. Supabase Dashboard → SQL Editor
2. `/supabase/schema.sql` dosyasının içeriğini kopyala
3. SQL Editor'da çalıştır (Run)

#### d) Storage Bucket'ları Oluştur
Supabase Dashboard → Storage → "New bucket":
- `avatars` (public)
- `route-images` (public)
- `place-images` (public)
- `review-images` (public)

### 4. Uygulamayı Başlat

```bash
# Development server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

---

## 📦 BUILD & EXPORT

### Development Build (Test)

```bash
npm run build:preview
```

Bu komut:
- Android APK oluşturur
- QR kod ile test edilebilir
- Internal test için hazır

### Production Build

#### Android (Google Play)

```bash
npm run build:android
```

- AAB (App Bundle) oluşturur
- Google Play Store'a yüklenmeye hazır

#### iOS (App Store)

```bash
npm run build:ios
```

⚠️ **Not:** iOS build için Apple Developer hesabı gereklidir.

### Build Detayları

Detaylı build kılavuzu için: **`BUILD_GUIDE.md`**

---

## 📂 PROJE YAPISI

```
Gurume/
├── app/
│   ├── (tabs)/                 # Ana ekranlar
│   │   ├── index.tsx          # Ana sayfa
│   │   ├── explore.tsx        # Keşfet & Arama
│   │   ├── create.tsx         # Rota oluştur
│   │   └── profile.tsx        # Profil
│   ├── auth/                   # Authentication
│   │   ├── login.tsx          # Giriş ekranı
│   │   └── register.tsx       # Kayıt ekranı
│   └── route/
│       └── [id].tsx           # Rota detay
├── components/                 # UI Components
├── constants/
│   └── theme.ts               # Renk paleti
├── contexts/
│   ├── AuthContext.tsx        # Auth state
│   └── GurumeDataContext.tsx  # Data state
├── data/
│   ├── mock-data.ts           # Test data
│   └── turkey-cities-districts.ts  # 81 il + ilçeler
├── lib/
│   └── supabase.ts            # Supabase client
├── services/                   # API Services
│   ├── auth.service.ts        # Authentication
│   ├── routes.service.ts      # Rotalar
│   ├── ratings.service.ts     # Değerlendirmeler
│   └── image-upload.service.ts  # Görsel yükleme
├── supabase/
│   └── schema.sql             # Database şeması
├── types/
│   └── index.ts               # TypeScript types
├── .env                        # Environment variables
├── app.json                    # Expo config
├── eas.json                    # EAS Build config
├── package.json
├── tsconfig.json
├── BUILD_GUIDE.md             # Detaylı build kılavuzu
├── PROJE_DURUMU.md            # Proje durum raporu
└── README.md                   # Bu dosya
```

---

## 🎯 KULLANICI AKIŞI

### 1. İlk Kullanım
1. Uygulamayı aç
2. Kayıt ol (email, kullanıcı adı, şifre)
3. Email onayı (opsiyonel)
4. Ana sayfaya yönlendir

### 2. Rota Keşfetme
1. **Ana Sayfa**: Top rated rotaları gör
2. **Keşfet**: Arama & filtreleme
   - Şehir seç
   - Min puan belirle
   - Sıralama seç
3. Rotaya tıkla → Detay sayfası
4. Rotayı kaydet veya değerlendir

### 3. Rota Oluşturma
1. **Profil** → "Rota Oluştur"
2. **Adım 1**: Temel bilgiler
   - Başlık
   - Açıklama
   - Şehir seçimi
   - Süre & mesafe
   - Etiketler
3. **Adım 2**: Duraklar
   - Durak açıklaması
   - Tadım notları
   - Süre
4. **Adım 3**: Görseller
   - Kapak görseli (zorunlu)
   - Ek görseller (maks 5)
5. **Yayınla** → Moderasyon → Onay

### 4. Profil Yönetimi
1. Avatar yükle
2. Profil düzenle (ad, bio, Instagram)
3. Kendi rotalarını gör
4. İstatistikler (toplam rota, ortalama puan)

---

## 🔒 GÜVENLİK

### Supabase RLS (Row Level Security)

Tüm tablolar RLS ile korunuyor:

- ✅ **Profiles**: Herkes okuyabilir, sadece sahibi güncelleyebilir
- ✅ **Routes**: Yayınlananlar herkese açık, taslaklar sadece sahibine
- ✅ **Ratings**: Herkes okuyabilir, sadece authenticated kullanıcılar ekleyebilir
- ✅ **Images**: Sadece yükleyen görüntüleyebilir

### Environment Variables

- ❌ `.env` dosyası git'e push edilmez
- ✅ Credentials güvende
- ✅ `.env.example` template olarak mevcut

---

## 🐛 SORUN GİDERME

### Build Hataları

#### "Module not found"
```bash
rm -rf node_modules
npm install
npm start
```

#### "Expo token expired"
```bash
npx expo logout
npx expo login
```

#### "Supabase connection failed"
- `.env` dosyasındaki credentials'ı kontrol et
- Supabase projesinin aktif olduğundan emin ol

### Runtime Hataları

#### "Image picker permission denied"
- `app.json` permissions kontrol et
- Cihaz ayarlarından izin ver

#### "Auth error: Invalid credentials"
- Database'de `profiles` tablosunun olduğunu kontrol et
- `handle_new_user()` trigger'ının çalıştığını kontrol et

---

## 📊 PERFORMANS

### Optimizasyonlar

- ✅ Image caching (expo-image)
- ✅ Lazy loading
- ✅ Database indexes
- ✅ Supabase RLS
- ✅ Pagination (maks 50 rota/sayfa)

### Bundle Size

- Initial load: ~5MB
- Images: CDN üzerinden
- Code splitting: Otomatik

---

## 🎨 TEMA & RENKLER

### Ana Renkler

- **Primary**: `#FF6B35` (Turuncu)
- **Secondary**: `#D84727` (Kırmızı)
- **Accent**: `#FFC857` (Sarı)
- **Background**: `#FFF8F0` (Krem)

### Dark Mode

- Otomatik sistem teması
- Custom dark colors
- Smooth transitions

---

## 📈 GELECEK ÖZELLIKLER

### Planlanan (v1.1)

- [ ] Push notifications
- [ ] Offline mode
- [ ] Share to social media
- [ ] Route directions (harita)
- [ ] User following system
- [ ] Comments on ratings
- [ ] Place suggestions

### İsteğe Bağlı

- [ ] In-app messaging
- [ ] Route collections
- [ ] Achievements & badges
- [ ] Premium subscription

---

## 🤝 KATKIDA BULUNMA

Bu proje export sorunları önlenecek şekilde optimize edilmiştir.

### Kod Standartları

- TypeScript strict mode
- ESLint + Prettier
- Git commit conventions
- Pull request template

---

## 📝 LİSANS

Bu proje özeldir ve tüm hakları saklıdır.

---

## 📞 DESTEK

### Dokümantasyon

- **BUILD_GUIDE.md**: Detaylı build kılavuzu
- **PROJE_DURUMU.md**: Proje durum raporu
- **Supabase Schema**: `/supabase/schema.sql`

### Harici Kaynaklar

- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)

---

## ✨ ÖZELLIKLER ÖZET

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Authentication | ✅ | Email/Password, Session management |
| User Profiles | ✅ | Avatar, Bio, Stats |
| Route Creation | ✅ | 3-step form, Image upload |
| Route Rating | ✅ | 5-star, Comments, Photos |
| Search & Filter | ✅ | City, Rating, Sort |
| Top Rated Routes | ✅ | Algoritmik sıralama |
| Image Upload | ✅ | Supabase Storage |
| 81 İl Data | ✅ | Tüm Türkiye |
| Dark Mode | ✅ | Auto system theme |
| EAS Build | ✅ | iOS + Android ready |
| TypeScript | ✅ | %100 type-safe |
| Responsive UI | ✅ | All screen sizes |

---

## 🎉 BAŞARIYLA TAMAMLANDI!

**Tüm özellikler çalışır durumda ve export edilmeye hazır.**

Build işlemine başlamak için: `BUILD_GUIDE.md` dosyasına bakın.

---

**Made with ❤️ for food lovers**
