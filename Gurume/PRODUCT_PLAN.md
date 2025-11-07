# Gurume Hızlı Başlangıç Planı

## 1. Özet ve Vizyon
- **Amaç:** Türkiye'nin 81 ilinde gezginlerin ve yerel gurmelerin hızla rota keşfedebileceği, kürasyonlu yemek-içmek rehberi.
- **Çekirdek değer:** İl/ilçe bazlı seçilmiş mekân listeleri ve 3-5 duraklı hazır rotalar ile “Ne yesem?” sorusunu anında çözüyor.
- **Uzun vadeli hedef:** Yerel öneriler + kullanıcı rotaları + topluluk puanlamalarıyla yeni gurme keşif platformu olmak.

## 2. Hedef Kullanıcı Segmentleri
- **Şehir gezgini (25-40 yaş):** Haftasonu kaçamaklarına çıkan, Instagram’da mekan arayan kişiler.
- **Yerel gurme:** Kendi ilçesini iyi bilen ve öneri paylaşmak isteyen bireyler.
- **İş seyahatçisi:** Kısa sürede en iyi seçenekleri arayan, zaman kısıtlı profesyoneller.

## 3. Problemler ve Fırsatlar
- Genel listeler (Google, Tripadvisor) çok kalabalık; kürasyon yok.
- Instagram’da bilgi dağınık, rota planlaması zor.
- Lezzet rotası uygulaması Türkiye’de niş; lokal içerik fırsatı var.

## 4. MVP Kapsamı (İlk 3 Hafta)
**Uygulama içinde**
- İl seçimi ve rota listesi ekranı.
- 3 pilot il (İstanbul, Gaziantep, İzmir) için her biri en az 1 rota.
- Rota detay ekranı (duraklar, notlar, puanlar).
- Basit filtreler (kategori tag’leri) ve favori butonu (yalnızca UI).

**Veri**
- Her il için 5-6 mekan kartı.
- Rota başına 3-4 durak, her durak için tadım notu + süre.
- Kısa açıklamalar ve fotoğraf URL’leri (Unsplash veya Google Maps).

**Gelecek faza bırakılanlar**
- Kullanıcı kaydı, gerçek zamanlı paylaşım.
- Konum tabanlı öneriler.
- Offline kullanım.

## 5. Teknik Çerçeve
- **Framework:** Expo (React Native) – mevcut proje `Gurume`.
- **Veri modeli:** Şimdilik `mock-data.ts` içinde statik JSON. 2. fazda Supabase/Firebase.
- **Tasarım:** Figma’da 4-5 ekranlık basit tasarım (renk paleti: sıcak toprak tonları).
- **Dağıtım:** Önce Expo Go / QR ile test; sonra EAS Build ile Android `.apk` (beta).

## 6. Yol Haritası
### Hafta 1 – Doğrulama & Taslak
- Problem ve kullanıcı hikayelerini dokümante et (`one-pager`).
- Figma’da ana akış: Ana sayfa → Rota listesi → Rota detay → Favoriler.
- 3 pilot il için içerik tablosu oluştur (Google Sheets yeterli).

### Hafta 2 – MVP Uygulaması
- Mevcut Expo projesinde veri modeli ve ekranları tamamla.
- Mock veriyi Google Sheet’ten alacak şekilde düzenle (CSV export).
- Manuel test: Farklı illerde navigasyon, rota görüntüleri.

### Hafta 3 – Pilot Yayın
- Expo Go ile 5 kişilik test grubu (arkadaş, aile, sosyal medya).
- Geri bildirim formu hazırla; deneyim, eksikler, puanlandırma.
- EAS Build Android `.apk` al ve sınırlı beta dağıt (Google Drive).

### Hafta 4 – Büyüme Hazırlığı
- Sosyal medya içerik planı (Instagram Reels, TikTok tadım videoları).
- Topluluk stratejisi (Telegram/Discord, yerel gurme elçileri).
- Yasal ve ticari hazırlık (şirketleşme, iş modeli).

## 7. Kurucu (Sen) İçin Aksiyon Listesi
- Kullanıcı araştırma için 10 kişilik röportaj listesi çıkar; soruları birlikte yazarız.
- Figma öğrenmek için 2 saatlik YouTube playlist (öneri sunacağım).
- İçerik toplamak için pilot illerde referans mekan listesi hazırla (Google Maps/star listesi).
- Haftalık rapor: Öğrendiklerin, geri bildirimler, yapılacaklar – burada beraber bakarız.

## 8. Asistan (Ben) İçin Sorumluluklar
- Expo projesini çalışır MVP’ye taşımak (rota oluşturma, listeleme akışları).
- Mock veriyi genişletmek ve yapılandırmak.
- Önerilen araçlar, kaynaklar, eğitim planları hazırlamak.
- Her sprint sonunda yapılacakları ve test senaryolarını listelemek.

## 9. Takip ve İletişim
- Haftalık hedef belirleme + bir sonraki hafta kontrol.
- Trello/Notion benzeri basit tahta önerisi (ücretsiz planlar).
- Geri bildirimleri `Feedback → Çözüm → Karar` formatında kaydet.

## 10. Bugün İçin Sonraki Adımlar
1. Kullanıcı hikayeleri ve problem cümlelerini kısa bir dokümanda çıkaracağım.
2. Mevcut projede eksik olan ekran/akışlar için görevleri belirleyeceğim.
3. Senin yapabilmen için “sıfırdan nasıl test ederim?” rehberi hazırlayacağım.

Hazır olduğunda sonraki sprintin detaylarını birlikte doldururuz.
