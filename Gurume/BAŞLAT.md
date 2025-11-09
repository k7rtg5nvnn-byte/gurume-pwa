# 🚀 UYGULAMAYI BAŞLAT

## ⚡ HIZLI BAŞLATMA

```bash
cd Gurume
npx expo start --clear --tunnel
```

Ardından:
1. QR kodu Expo Go ile tara (telefonda)
2. VEYA web'de aç: `w` tuşuna bas
3. VEYA Android emülatörde aç: `a` tuşuna bas

---

## 📱 EXPO GO İLE TEST

### 1. Expo Go İndir:
- [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [iOS](https://apps.apple.com/app/expo-go/id982107779)

### 2. QR Kodu Tara:
Terminal'de çıkan QR kodu Expo Go ile tara

### 3. Uygulama Açılır:
- Ana ekran → Rotaları görürsün
- Keşfet → Filtreleme yap
- Oluştur → Yeni rota ekle (giriş gerekli)
- Profil → Profil düzenle

---

## 🗺️ GOOGLE MAPS İÇİN (İSTEĞE BAĞLI)

Haritaların düzgün görünmesi için:

```bash
# Rehberi oku:
cat GOOGLE_MAPS_SETUP.md
```

API key almadan da çalışır, sadece harita eksik görünür.

---

## 🎯 TEST SENARYOLARI

### 1. Ana Ekran Test:
- ✅ Rotaları gör
- ✅ Şehir kartlarına tıkla
- ✅ Top rated ve trending bölümleri

### 2. Keşfet Test:
- ✅ Arama kutusuna "kebap" yaz
- ✅ Şehir seçimi: İstanbul'u seç
- ✅ Puan filtresi: 4+ seç
- ✅ Sıralama: Popüler seç

### 3. Rota Detay Test:
- ✅ Herhangi bir rotaya tıkla
- ✅ Aşağı kaydır → Haritayı gör
- ✅ Durakları gör
- ✅ "Google Maps'te Aç" tıkla

### 4. Rota Oluşturma Test:
- ⚠️ Önce giriş yap
- ✅ Adım 1: Bilgileri doldur
- ✅ Şehir seç (dropdown)
- ✅ Adım 2: Durak ekle
- ✅ Adım 3: Görsel yükle
- ✅ Yayınla

### 5. Profil Test:
- ⚠️ Önce giriş yap
- ✅ Avatar'a tıkla → Fotoğraf yükle
- ✅ "Profili Düzenle" → Bilgileri güncelle
- ✅ Rotalarını gör

---

## ⚠️ SORUN GİDERME

### "Metro waiting on..." dondu kaldı:
```bash
# Ctrl+C ile durdur
# Yeniden başlat:
npx expo start --clear
```

### "Cannot connect to Metro":
```bash
# Tunnel modunu dene:
npx expo start --tunnel
```

### QR kod okumadı:
```bash
# Expo hesabı ile giriş yap:
npx expo login
# Sonra başlat:
npx expo start
```

### Hata mesajları:
1. `rm -rf .expo`
2. `npx expo start --clear`

---

## 📝 ÖNEMLİ NOTLAR

### Test Mode:
- Görsel yükleme: Simüle ediliyor (Unsplash URL)
- Google Maps: API key olmadan çalışır (eksik görünür)
- Mock data: 5 örnek rota yüklü

### Gerçek Kullanım:
1. Supabase'e bağlan (`.env` dosyası)
2. Google Maps API key ekle (`app.json`)
3. Production build: `npm run build:android`

---

## 🎊 BAŞARILI!

Uygulama çalışıyor mu?
- ✅ Rotaları görebiliyor musun?
- ✅ Keşfet filtreleme yapıyor mu?
- ✅ Rota detayı açılıyor mu?
- ✅ Profil çalışıyor mu?

**HEPSİ ✅ İSE → BAŞARILI! 🎉**

---

Sorularınız için:
- `YAPILAN_DEĞİŞİKLİKLER.md` → Tam rapor
- `GOOGLE_MAPS_SETUP.md` → Harita kurulumu
- `KULLANIM_KILAVUZU.md` → Detaylı kullanım

**GOOD LUCK! 🚀**
