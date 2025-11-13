# Gurume – Türkiye Lezzet Rotası Uygulaması

Expo Router kullanılarak geliştirilen Gurume, 81 il için kürasyonlu yemek-içmek rotaları sunar. Kullanıcılar:

- Şehirlere göre önerileri keşfedebilir
- Konumuna göre yakın rotalar için bildirim alır
- Favori rotalar listesini yönetir
- Kendi rotalarını oluşturup Supabase üzerinde saklar

## Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. `.env` dosyası oluşturup Supabase bilgilerini girin (demo modunda boş bırakabilirsiniz):

   ```ini
   EXPO_PUBLIC_SUPABASE_URL=https://<proje-id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

3. Geliştirme sunucusunu başlatın:

   ```bash
   npx expo start
   ```

4. QR kodu Expo Go ile okutun veya emülatörde açın.

## Supabase Yapılandırması

Aşağıdaki tabloları oluşturun:

- `profiles`
- `routes`
- `route_stops`
- `favorites`
- `places` (opsiyonel, moderasyonlu mekan eklemek için)

`types/database.ts` dosyasında şema örneği yer alıyor. `profiles` tablosu `auth.users` ile 1-1 eşleşecek şekilde tasarlandı.

### RLS Önerisi

- `profiles`: kullanıcı kendi profiline erişebilir.
- `routes`: `is_published = true` olan rotalar herkese görünür, kendi rotanı düzenleyebilirsin.
- `route_stops`: `routes.user_id = auth.uid()` şartı.
- `favorites`: kullanıcı sadece kendi kayıtlarını görebilir/düzenler.

## Özellikler

- **Konum tabanlı öneri:** Expo Location ile en yakın rotalar listelenir, Expo Notifications ile bildirim gönderilir.
- **Favoriler:** Supabase üzerinde kullanıcıya özel saklanır.
- **Rota oluşturma:** Şehir/ilçe seçimi, dinamik stop ekleme, Supabase’e kaydetme.
- **Profil yönetimi:** Ad, telefon, bio, şehir/ilçe bilgilerini güncelleme.
- **Demo modu:** Supabase yapılandırılmadığında veriler cihaz üzerinde saklanır, giriş olmadan gezilebilir.

## Önemli Komutlar

- `npm run lint`: Kod kalitesini kontrol eder.
- `npx expo start --tunnel`: QR kodu paylaşmak için tünel açar.

## Bildirim ve Konum İzinleri

`app.json` içinde iOS ve Android izin açıklamaları tanımlanmıştır. Android için `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `POST_NOTIFICATIONS` izinleri otomatik olarak istenir.

## Tasarım Notları

- Renk paleti sarı/turuncu/kırmızı tonlarında
- Bileşenler `components/themed-*` yapısı ile tema dostu
- Tüm 81 ilin verileri `turkiyeapi.dev` üzerinden dinamik olarak yüklenir; Supabase yoksa dahi şehir listeleri güncellenir.

## Geliştirme Yol Haritası

- Rotalar için kullanıcı yorum/puanlama
- Supabase Edge Functions ile moderasyon akışı
- Harita görünümü ve navigasyon entegrasyonu
- Topluluk modülü (rota paylaşımı, yorumlar)
