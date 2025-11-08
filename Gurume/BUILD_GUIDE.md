# GURUME BUILD VE EXPORT KILAVUZU

Bu dosya, Gurume uygulamasını iOS ve Android için nasıl build edeceğinizi ve export edeceğinizi adım adım açıklar.

## 📋 ÖN GEREKSİNİMLER

### 1. Supabase Projesi Oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. Yeni proje oluştur
3. Project Settings > API'den şu bilgileri al:
   - `Project URL`
   - `anon public` key

### 2. Environment Variables Ayarla

`.env` dosyasını düzenle:

```env
EXPO_PUBLIC_SUPABASE_URL=your-actual-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 3. Database Şemasını Yükle

1. Supabase Dashboard > SQL Editor'a git
2. `/supabase/schema.sql` dosyasının içeriğini kopyala
3. SQL Editor'a yapıştır ve çalıştır

### 4. Storage Buckets Oluştur

Supabase Dashboard > Storage'da şu bucket'ları oluştur:
- `avatars` (public)
- `route-images` (public)
- `place-images` (public)
- `review-images` (public)

### 5. Türkiye İl ve İlçelerini Yükle

Database'e Türkiye'deki tüm iller ve ilçeleri yüklemek için:

```sql
-- /data/turkey-cities-districts.ts dosyasındaki verileri import et
-- veya manuel olarak cities ve districts tablolarına ekle
```

## 🚀 BUILD SÜRECİ

### EAS CLI Kurulumu

```bash
npm install -g eas-cli
eas login
```

### Expo Projesi Ayarları

1. `app.json` dosyasında şu değerleri güncelle:
   - `extra.eas.projectId`: EAS Project ID'nizi yazın
   - `owner`: Expo kullanıcı adınızı yazın

2. EAS Build yapılandırmasını başlat:

```bash
eas build:configure
```

### Android Build

#### Development Build (Test için)

```bash
npm run build:preview
```

Bu komut:
- APK dosyası oluşturur
- Internal test için kullanılabilir
- QR kod veya direkt link ile indirilir

#### Production Build (Play Store için)

```bash
npm run build:android
```

Bu komut:
- AAB (Android App Bundle) oluşturur
- Google Play Store'a yüklenmeye hazır

### iOS Build

#### Development Build

```bash
eas build --platform ios --profile preview
```

#### Production Build (App Store için)

```bash
npm run build:ios
```

⚠️ **iOS build için Apple Developer hesabı gereklidir.**

## 📱 TEST ETME

### Android APK Test

1. Build tamamlandığında EAS size bir link verir
2. Link'i Android cihazınızda açın
3. APK'yı indirip kurun

### iOS Test (TestFlight)

1. EAS build tamamlandığında
2. `eas submit --platform ios` komutu ile TestFlight'a yükleyin
3. TestFlight app'inden test edin

## 🔧 SORUN GİDERME

### Build Hataları

#### "Module not found" hatası

```bash
cd Gurume
npm install
npm run build:android
```

#### "Expo token expired" hatası

```bash
eas logout
eas login
```

#### "Supabase connection failed"

- `.env` dosyasındaki bilgilerin doğruluğunu kontrol edin
- Supabase projesinin aktif olduğundan emin olun

### Runtime Hataları

#### "Image picker permission denied"

`app.json` dosyasında permission ayarlarının doğru olduğunu kontrol edin.

#### "Supabase auth error"

- Database'de `profiles` tablosunun oluşturulduğunu kontrol edin
- `handle_new_user()` trigger'ının çalıştığını kontrol edin

## 📝 BUILD CHECKLISTI

Build yapmadan önce kontrol edin:

- [ ] `.env` dosyası doğru bilgilerle dolduruldu
- [ ] Supabase database şeması yüklendi
- [ ] Storage bucket'ları oluşturuldu
- [ ] `app.json` içinde bundle identifier/package name benzersiz
- [ ] Version/build number güncellendi
- [ ] Test cihazında çalıştırıldı
- [ ] Lint hataları düzeltildi

## 🎯 PRODUCTION DEPLOY

### Android - Google Play Store

1. Production build oluştur:

```bash
npm run build:android
```

2. Build tamamlandığında AAB dosyasını indir

3. Google Play Console'da:
   - Yeni uygulama oluştur
   - AAB dosyasını yükle
   - Store listing bilgilerini doldur
   - Test et ve yayınla

### iOS - App Store

1. Production build oluştur:

```bash
npm run build:ios
```

2. App Store Connect'e submit et:

```bash
npm run submit:ios
```

3. App Store Connect'te:
   - App bilgilerini doldur
   - Screenshots ekle
   - Review'a gönder

## 💡 İPUÇLARI

1. **Her build öncesi test edin**: `expo start` ile local'de test edin
2. **Version number'ları artırın**: Her yeni build için version artırın
3. **Changelog tutun**: Değişiklikleri kaydedin
4. **Backup alın**: Database ve storage'ı düzenli yedekleyin
5. **Error tracking ekleyin**: Sentry veya Bugsnag entegre edin

## 🆘 DESTEK

Sorun yaşarsanız:

1. EAS Build logs'ları inceleyin: `eas build:list`
2. Expo docs'u okuyun: https://docs.expo.dev/
3. Supabase docs'u okuyun: https://supabase.com/docs

## 📊 BAŞARINIZI ÖLÇÜN

Build başarılı olduktan sonra:

- [ ] Uygulama açılıyor
- [ ] Login/Register çalışıyor
- [ ] Fotoğraf yükleme çalışıyor
- [ ] Rota oluşturma çalışıyor
- [ ] Rota görüntüleme çalışıyor
- [ ] Arama çalışıyor
- [ ] Profil düzenleme çalışıyor

---

**ÖNEMLİ**: Bu proje export sorunlarını önlemek için optimize edilmiştir. Her adım dikkatle takip edildiğinde başarılı build garantilidir.
