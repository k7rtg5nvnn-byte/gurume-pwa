# 🚀 GURUME UYGULAMASI - BAŞLAMADAN ÖNCE OKU

## ⚠️ ÖNEMLİ: İLK ADIMLAR

Bu dokümantasyonu takip ederek **hiç hata almadan** uygulamanızı çalıştırabilirsiniz.

---

## 1️⃣ SUPABASE KURULUMU (ZORUNLU)

Uygulama çalışması için **Supabase** gereklidir.

### Adım 1: Supabase Hesabı Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" → Sign up
3. GitHub ile giriş yap (en kolay)

### Adım 2: Yeni Proje Oluştur

1. Dashboard → "New project"
2. Project name: `gurume`
3. Database Password: **Güçlü bir şifre belirle ve KAYDET**
4. Region: `Europe (Frankfurt)` (Türkiye'ye en yakın)
5. "Create new project" → 2-3 dakika bekle

### Adım 3: Credentials Al

Proje hazır olunca:

1. Settings (sol menü) → API
2. **Project URL**'i kopyala
3. **anon public key**'i kopyala

### Adım 4: .env Dosyasını Güncelle

`Gurume/.env` dosyasını aç ve düzenle:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adım 5: Database Şemasını Yükle

1. Supabase Dashboard → **SQL Editor** (sol menü)
2. `/workspace/Gurume/supabase/schema.sql` dosyasını aç
3. **TÜM İÇERİĞİ** kopyala (Ctrl+A, Ctrl+C)
4. SQL Editor'a yapıştır
5. **Run** butonuna bas
6. ✅ "Success" mesajını gör

### Adım 6: Storage Bucket'ları Oluştur

1. Supabase Dashboard → **Storage** (sol menü)
2. "Create a new bucket" → `avatars` → **Public** → Create
3. Aynı şekilde 3 bucket daha:
   - `route-images` (Public)
   - `place-images` (Public)
   - `review-images` (Public)

---

## 2️⃣ NODE PACKAGES KURULUMU

Terminal'de:

```bash
cd /workspace/Gurume
npm install
```

---

## 3️⃣ UYGULAMAYI ÇALIŞTIR

### Development Mode

```bash
npm start
```

Terminal'de QR kod çıkacak. 3 seçeneğiniz var:

#### Seçenek A: iOS Simulator (Sadece Mac)

```bash
npm run ios
```

#### Seçenek B: Android Emulator

```bash
npm run android
```

#### Seçenek C: Fiziksel Telefon

1. App Store / Play Store → **Expo Go** indir
2. QR kodu Expo Go ile tara
3. Uygulama açılacak

---

## 4️⃣ İLK KULLANIM

### Kayıt Ol

1. Uygulama açıldığında "Hemen Başla"
2. "Kayıt Ol" → Email, kullanıcı adı, şifre gir
3. "Kayıt Ol" butonuna bas
4. ✅ Ana sayfaya yönlendirileceksin

### Test Kullanıcısı (Opsiyonel)

Manuel kayıt yerine Supabase'den test kullanıcısı oluştur:

1. Supabase Dashboard → **Authentication** → Users
2. "Add user" → Email & Password
3. Email: `test@gurume.com`
4. Password: `Test123456`
5. Uygulamada bu bilgilerle giriş yap

---

## 5️⃣ SORUN GİDERME

### "Supabase connection error"

**Çözüm**: `.env` dosyasındaki URL ve key'i kontrol et.

```bash
# Terminal'de kontrol et:
cat /workspace/Gurume/.env

# Doğru formatta olmalı:
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### "Metro bundler error"

**Çözüm**: Cache temizle ve yeniden başlat:

```bash
npm start -- --clear
```

### "Module not found"

**Çözüm**: node_modules'u sil ve yeniden yükle:

```bash
rm -rf node_modules
npm install
npm start
```

### "Database error: relation does not exist"

**Çözüm**: Database şemasını yeniden yükle (Adım 5).

### "Image picker permission denied"

**Çözüm**: Telefondan uygulamaya izin ver:
- iOS: Settings → Gurume → Photos → "All Photos"
- Android: Settings → Apps → Gurume → Permissions → Storage → Allow

---

## 6️⃣ BUILD (EXPORT) İÇİN

Uygulamayı test ettikten sonra build almak için:

```bash
# EAS CLI kur (sadece 1 kere)
npm install -g eas-cli

# Expo hesabı ile giriş yap
npx expo login

# Android build
npm run build:android

# iOS build (Apple Developer hesabı gerekli)
npm run build:ios
```

**Detaylı build kılavuzu**: `BUILD_GUIDE.md`

---

## 7️⃣ ÖZELLIKLER

### ✅ Tamamlanmış

- ✅ Kullanıcı kayıt/giriş
- ✅ Profil yönetimi (avatar, bio)
- ✅ Rota oluşturma (3 aşamalı)
- ✅ Rota listeleme (puana göre sıralı)
- ✅ Rota detay sayfası
- ✅ Rating & Review sistemi
- ✅ Gelişmiş arama & filtreleme
- ✅ 81 il + ilçeler
- ✅ Görsel yükleme (Supabase Storage)
- ✅ Dark mode
- ✅ TypeScript %100
- ✅ Lint hataları temizlendi

### 🎨 Tasarım

- Turuncu, Kırmızı, Sarı tonlarında modern UI
- Responsive (tüm ekran boyutları)
- Animations & transitions

---

## 8️⃣ PROJE YAPISI

```
Gurume/
├── app/                        # Ekranlar
│   ├── (tabs)/                # Ana tab'lar
│   │   ├── index.tsx         # Ana sayfa
│   │   ├── explore.tsx       # Keşfet & Ara
│   │   ├── create.tsx        # Rota oluştur
│   │   └── profile.tsx       # Profil
│   ├── auth/                 # Giriş/Kayıt
│   └── route/[id].tsx        # Rota detay
├── services/                  # API servisleri
│   ├── auth.service.ts       # Authentication
│   ├── routes.service.ts     # Rotalar
│   ├── ratings.service.ts    # Değerlendirmeler
│   └── image-upload.service.ts
├── supabase/
│   └── schema.sql            # Database şeması
├── .env                       # ⚠️ Credentials (GİZLİ)
├── README.md                  # Ana dokümantasyon
├── BUILD_GUIDE.md            # Build kılavuzu
└── BAŞLAMADAN_ÖNCE_OKU.md    # Bu dosya
```

---

## 9️⃣ YARDIM & DESTEK

### Dokümantasyon

- **README.md**: Genel bakış ve özellikler
- **BUILD_GUIDE.md**: Detaylı build kılavuzu
- **PROJE_DURUMU.md**: Tamamlanan görevler

### Harici Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

---

## 🎯 HIZLI BAŞLANGIÇ KONTROL LİSTESİ

Hazır mısın? Bu listeyi takip et:

- [ ] Supabase hesabı oluşturdum
- [ ] Yeni proje oluşturdum
- [ ] Project URL ve anon key aldım
- [ ] `.env` dosyasını güncelledim
- [ ] SQL şemasını yükledim
- [ ] Storage bucket'ları oluşturdum
- [ ] `npm install` çalıştırdım
- [ ] `npm start` ile uygulamayı başlattım
- [ ] Kayıt oldum / Test kullanıcısıyla giriş yaptım
- [ ] Ana sayfa açıldı ✅

---

## ⚡ HIZLI BAŞLANGIÇ (TÜM KOMUTLAR)

```bash
# 1. Packages kur
cd /workspace/Gurume
npm install

# 2. Supabase .env'i düzenle
# (Yukarıdaki adımları takip et)

# 3. Uygulamayı başlat
npm start

# 4. iOS (Mac only)
npm run ios

# 5. Android
npm run android
```

---

## 🎉 BAŞARIYLA KURULDU!

Artık **Gurume** uygulaması cihazınızda çalışıyor!

**Sonraki adım**: Uygulamayı test et ve build al.

---

## 📞 SIK SORULAN SORULAR

### Supabase ücretsiz mi?

✅ Evet! Free tier:
- 500MB database
- 1GB file storage
- 50,000 monthly active users

Başlangıç için **fazlasıyla yeterli**.

### Build için ne kadar sürer?

- Android: ~15 dakika
- iOS: ~20 dakika

### Apple Developer hesabı gerekli mi?

- Android: ❌ Hayır
- iOS: ✅ Evet ($99/yıl)

Test için iOS Simulator kullanabilirsin (ücretsiz).

---

**Hazırsın! Bol şans! 🚀**
