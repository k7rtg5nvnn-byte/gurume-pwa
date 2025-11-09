# 🗺️ Google Maps Kurulum Rehberi

## 1. Google Maps API Key Alma

### Adım 1: Google Cloud Console'a Git
1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Proje oluştur veya mevcut projeyi seç

### Adım 2: Maps SDK'larını Etkinleştir
1. Sol menüden **APIs & Services** > **Library**
2. Ara: **"Maps SDK for Android"** → Enable
3. Ara: **"Maps SDK for iOS"** → Enable

### Adım 3: API Key Oluştur
1. Sol menüden **APIs & Services** > **Credentials**
2. **+ CREATE CREDENTIALS** → **API Key**
3. Key oluşturuldu! ✅
4. **İki ayrı key** oluştur:
   - Biri Android için
   - Biri iOS için

### Adım 4: API Key'leri Kısıtla (ÖNEMLİ!)
**Android Key:**
- **Application restrictions** → Android apps
- Package name: `com.gurume.app`
- SHA-1 fingerprint: (Expo build'de otomatik)

**iOS Key:**
- **Application restrictions** → iOS apps
- Bundle ID: `com.gurume.app`

### Adım 5: API'leri Sınırla
Her iki key için de:
- **API restrictions** → Restrict key
- Seç: 
  - ✅ Maps SDK for Android
  - ✅ Maps SDK for iOS

## 2. API Key'leri Uygulamaya Ekle

### `app.json` dosyasını güncelle:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSy... İOS API KEY BURAYA"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy... ANDROID API KEY BURAYA"
        }
      }
    }
  }
}
```

## 3. Test Et

```bash
# Önce temizlik
rm -rf node_modules .expo
npm cache clean --force
npm install

# Başlat
npx expo start --clear --tunnel
```

## 4. Önemli Notlar

⚠️ **ÜCRETSİZ KOTA:**
- Google Maps: Ayda $200 ücretsiz kredi
- ~28,000 harita yüklemesi ücretsiz
- Aşılırsa ücretlendirilirsin!

⚠️ **GÜVENLİK:**
- API key'leri GitHub'a push etme
- Mutlaka key restriction ekle
- Production'da billing limitleri ayarla

🎯 **TEST MODU:**
- Web'de harita çalışmayabilir (normal)
- Android/iOS'ta düzgün çalışır
- Expo Go ile test edebilirsin

## 5. Harita Özellikleri

✅ **Şu anda çalışan:**
- Rota detayında harita gösterimi
- Her durak için marker
- Marker'lara tıklayınca durak bilgisi
- "Google Maps'te Aç" butonu → Her durak için

✅ **Nasıl kullanılır:**
1. Ana ekrandan bir rota seç
2. Rota detayına gir
3. Aşağı kaydır → Harita bölümü
4. Haritada marker'ları gör
5. Her durakta "📍 Google Maps'te Aç" butonuna tıkla
6. Google Maps uygulaması açılır ve konumu gösterir

## 6. Sorun Giderme

**Harita boş görünüyor:**
- API key'leri doğru mu kontrol et
- İzinleri (Location) kontrol et
- `npx expo start --clear` ile yeniden başlat

**"Error loading map" hatası:**
- API key restriction'ları kontrol et
- Bundle ID ve package name doğru mu?
- API'ler enabled mi?

**Marker'lar görünmüyor:**
- `mockRoutes` datasında latitude/longitude var mı kontrol et
- `data/mock-routes.ts` dosyasını incele

## 7. Sonraki Adımlar

🚀 **Gelecekte eklenecek:**
- [ ] Rotayı takip et (navigation)
- [ ] Duraklar arası yol çizimi
- [ ] Yakındaki rotalar (location-based)
- [ ] Offline harita desteği
- [ ] AR navigation

---

📧 Sorularınız için: [sezginnxd@gmail.com](mailto:sezginnxd@gmail.com)
