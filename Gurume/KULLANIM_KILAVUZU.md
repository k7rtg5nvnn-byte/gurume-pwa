# 🍽️ GURUME UYGULAMASI - KULLANIM KILAVUZU

## ✅ TAMAMLANDI VE ÇALIŞIYOR!

---

## 📱 UYGULAMAYI BAŞLAT

```bash
cd /workspace/Gurume
npx expo start --clear --tunnel
```

Sonra **w** tuşuna bas (web'de aç)

---

## 🎯 ÇALIŞAN ÖZELLİKLER

### 1️⃣ ANA SAYFA (/)
- ✅ **Top Rated Rotalar** görünüyor (5 rota)
- ✅ **Trending Rotalar** görünüyor (5 rota)
- ✅ **Popüler Şehirler** kartları
- ✅ Şehir kartlarına tıklayınca o şehrin rotalarına gidiyor

### 2️⃣ KEŞFETİN (/explore)
- ✅ **Arama çubuğu** çalışıyor
- ✅ **Şehir filtreleme** butonları (İstanbul, Ankara, İzmir, vb.)
- ✅ **Puan filtreleme** (Tümü, 3+, 4+, 4.5+)
- ✅ **Sıralama** (Puana Göre, Popüler, Yeni)
- ✅ Rotalar kartlar halinde görünüyor
- ✅ Rota kartlarına tıklayınca detaya gidiyor

### 3️⃣ İL BAZLI ROTA GÖRÜNTÜLEME (/city/[id])
✅ **YENİ EKLENDI!**
- Şehir hero görseli
- Şehir açıklaması
- Öne çıkan lezzetler
- O şehre ait tüm rotalar
- Puana göre sıralı

**Nasıl Gidilir:**
- Ana sayfada şehir kartına tıkla
- VEYA explore'da şehir seç, sonra rota kartına tıkla

### 4️⃣ ROTA DETAY (/route/[id])
- ✅ Rota bilgileri
- ✅ Kapak görseli
- ✅ Puan ve değerlendirme sayısı
- ✅ Duraklar listesi
- ✅ Süre, mesafe, zorluk bilgileri
- ✅ Etiketler
- ✅ Yazar bilgisi

### 5️⃣ PROFİL (/profile)
- ✅ Kullanıcı bilgileri
- ✅ Avatar görseli
- ✅ İstatistikler (rota sayısı, vb.)
- ✅ Profil düzenleme formu
- ✅ Kullanıcının rotaları
- ✅ Çıkış yapma

### 6️⃣ ROTA OLUŞTUR (/create)
- ✅ 3 aşamalı form
- ✅ Şehir seçimi (dropdown liste)
- ✅ Durak ekleme
- ✅ Görsel yükleme (simüle)
- ✅ Progress bar

### 7️⃣ GİRİŞ/KAYIT
- ✅ Login ekranı
- ✅ Register ekranı
- ✅ Form validasyonları
- ✅ Hata mesajları

---

## 🎨 MOCK DATA (TEST VERİLERİ)

### 5 Hazır Rota:
1. **Kadıköy Lezzet Rotası** (İstanbul) - ⭐ 4.8
2. **Ankara Gurme Turu** (Ankara) - ⭐ 4.6
3. **İzmir Kordon Lezzet Yolu** (İzmir) - ⭐ 4.9
4. **Gaziantep Baklava ve Kebap Turu** (Gaziantep) - ⭐ 5.0
5. **Bursa İskender ve Kestane Şekeri** (Bursa) - ⭐ 4.7

### Her Rotada:
- Kapak görseli
- 2-3 durak
- Puan ve değerlendirme
- Yazar bilgisi
- Etiketler

---

## 🔍 TEST SENARYOLARI

### Senaryo 1: İl Bazlı Rota Görme
1. Uygulamayı aç
2. Ana sayfada **"İstanbul"** kartına tıkla
3. ✅ İstanbul şehir sayfası açılır
4. ✅ "Kadıköy Lezzet Rotası" görünür
5. Rota kartına tıkla
6. ✅ Rota detayı açılır

### Senaryo 2: Arama ve Filtreleme
1. **Keşfet** sekmesine git
2. Arama kutusuna **"kebap"** yaz
3. ✅ Kebap içeren rotalar gösterilir
4. **"Ankara"** şehir butonuna tıkla
5. ✅ Sadece Ankara rotaları gösterilir
6. **"4.5+"** puan filtresine tıkla
7. ✅ Sadece 4.5+ puanlı rotalar gösterilir

### Senaryo 3: Rota Oluşturma
1. **Rota Oluştur** sekmesine git
2. Başlık gir: "Test Rotası"
3. Açıklama gir
4. Şehir seç (dropdown'a tıkla)
5. **"İleri"** butonuna bas
6. Durak ekle
7. **"İleri"** butonuna bas
8. (Görsel yükleme simüle)
9. **"Yayınla"** butonuna bas
10. ✅ "Başarılı" mesajı gösterilir

### Senaryo 4: Profil
1. **Profil** sekmesine git
2. ✅ Kullanıcı bilgileri görünür
3. ✅ İstatistikler görünür
4. **"Profili Düzenle"** butonuna tıkla
5. Ad/Bio değiştir
6. **"Kaydet"** butonuna tıkla
7. ✅ Profil güncellenir

---

## 🎨 TASARIM

### Renk Paleti
- **Primary**: Turuncu (#FF6B35)
- **Secondary**: Kırmızı (#D84727)
- **Accent**: Sarı (#FFC857)
- Modern, responsive, dark mode destekli

### Componentler
- Güzel kart tasarımları
- Smooth animasyonlar
- İkon kullanımı
- Badge'ler ve tag'ler

---

## ⚠️ ÖNEMLİ NOTLAR

### Şu An Mock Data Kullanılıyor
- Rotalar gerçek değil, test verisi
- Supabase'e bağlı değil (henüz veri yok)
- Görsel yükleme simüle ediliyor

### Gerçek Kullanım İçin:
1. Supabase'e kayıt ol
2. Database şemasını yükle
3. Storage bucket'ları oluştur
4. `.env` dosyasını düzenle
5. Mock data yerine gerçek Supabase calls kullan

---

## 🐛 SORUN ÇÖZME

### "Cannot read property" Hatası
- Uygulamayı durdur (Ctrl+C)
- Cache temizle: `npx expo start --clear --tunnel`
- Yeniden başlat

### Rotalar Görünmüyor
- Mock data yüklü mü kontrol et: `data/mock-routes.ts`
- Console'da hata var mı bak

### Görsel Yükleme Çalışmıyor
- Normal! Henüz Supabase'e bağlı değil
- Test için placeholder görseller kullanılıyor

---

## 📞 YARDIM

Sorun olursa:
1. Console'daki hataları kontrol et
2. `npm run lint` çalıştır
3. Cache temizle ve yeniden başlat

---

## ✅ SONUÇ

**UYGULAMA ÇALIŞIYOR!**

- 5 ana ekran ✅
- İl bazlı rota görüntüleme ✅
- Arama ve filtreleme ✅
- Mock data ile test ✅
- Modern tasarım ✅
- Sıfır critical hata ✅

---

**HEMEN TEST ET!**

```bash
npx expo start --clear --tunnel
w
```
