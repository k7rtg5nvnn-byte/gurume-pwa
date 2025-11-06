import type { GurumeData } from '@/types';

export const mockData: GurumeData = {
  cities: [
    {
      id: 'city-istanbul',
      name: 'İstanbul',
      slug: 'istanbul',
      description: 'Tarihi sokak lezzetleri ve modern fine dining sahnesiyle 7/24 yaşayan şehir.',
      heroImage:
        'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1200&q=80',
      highlightTags: ['Sokak Lezzeti', 'Meze', 'Gurme Kahve'],
      signatureDishes: ['Midye Dolma', 'Islak Hamburger', 'Kokoreç'],
      coordinates: {
        latitude: 41.0082,
        longitude: 28.9784,
      },
    },
    {
      id: 'city-gaziantep',
      name: 'Gaziantep',
      slug: 'gaziantep',
      description: 'Antep fıstığının başkenti; kebap, baklava ve yöresel tatların merkezi.',
      heroImage:
        'https://images.unsplash.com/photo-1568600891621-2b79da53aa30?auto=format&fit=crop&w=1200&q=80',
      highlightTags: ['Kebap', 'Tatlı', 'Yerel'],
      signatureDishes: ['Ali Nazik', 'Lahmacun', 'Katmer'],
      coordinates: {
        latitude: 37.0662,
        longitude: 37.3833,
      },
    },
    {
      id: 'city-izmir',
      name: 'İzmir',
      slug: 'izmir',
      description: 'Ege mutfağı, deniz ürünleri ve kahvaltı kültürüyle sakin gurme rotaları.',
      heroImage:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      highlightTags: ['Ege', 'Kahvaltı', 'Şarap'],
      signatureDishes: ['Boyoz', 'Kumru', 'Deniz Mahsulleri'],
      coordinates: {
        latitude: 38.4237,
        longitude: 27.1428,
      },
    },
  ],
  districts: [
    {
      id: 'district-beyoglu',
      cityId: 'city-istanbul',
      name: 'Beyoğlu',
    },
    {
      id: 'district-kadikoy',
      cityId: 'city-istanbul',
      name: 'Kadıköy',
    },
    {
      id: 'district-sahinbey',
      cityId: 'city-gaziantep',
      name: 'Şahinbey',
    },
    {
      id: 'district-konak',
      cityId: 'city-izmir',
      name: 'Konak',
    },
  ],
  places: [
    {
      id: 'place-istanbul-1',
      cityId: 'city-istanbul',
      districtId: 'district-beyoglu',
      name: 'Karadeniz Döner Asım Usta',
      summary: '40 yıllık döner geleneği; çıtır lavaş eşliğinde tereyağlı et.',
      specialties: ['Tereyağlı Döner', 'Ayran'],
      speedScore: 4.5,
      cleanlinessScore: 4.2,
      valueScore: 4.8,
      priceLevel: '₺₺',
      heroImage:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 41.0461,
        longitude: 28.9856,
      },
    },
    {
      id: 'place-istanbul-2',
      cityId: 'city-istanbul',
      districtId: 'district-kadikoy',
      name: 'Çiya Sofrası',
      summary: 'Anadolu’nun kaybolan tariflerini modern dokunuşla sunan efsane lokanta.',
      specialties: ['Kabak Çiçeği Dolması', 'Şiveydiz'],
      speedScore: 4.1,
      cleanlinessScore: 4.6,
      valueScore: 4.4,
      priceLevel: '₺₺₺',
      heroImage:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 40.9915,
        longitude: 29.0255,
      },
    },
    {
      id: 'place-istanbul-3',
      cityId: 'city-istanbul',
      districtId: 'district-beyoglu',
      name: 'Mandabatmaz',
      summary: 'Köpüklü Türk kahvesiyle meşhur minik kahve durağı.',
      specialties: ['Türk Kahvesi', 'Lokum'],
      speedScore: 4.7,
      cleanlinessScore: 4.3,
      valueScore: 4.9,
      priceLevel: '₺',
      heroImage:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 41.0362,
        longitude: 28.9771,
      },
    },
    {
      id: 'place-gaziantep-1',
      cityId: 'city-gaziantep',
      districtId: 'district-sahinbey',
      name: 'İmam Çağdaş',
      summary: 'Antep kebap ve baklavanın klasik adresi, yoğun servis temposu.',
      specialties: ['Ali Nazik', 'Fıstıklı Baklava'],
      speedScore: 4.3,
      cleanlinessScore: 4.5,
      valueScore: 4.2,
      priceLevel: '₺₺₺',
      heroImage:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 37.0609,
        longitude: 37.3766,
      },
    },
    {
      id: 'place-gaziantep-2',
      cityId: 'city-gaziantep',
      districtId: 'district-sahinbey',
      name: 'Metanet Lokantası',
      summary: 'Simit kebabı ve yöresel çorbalarıyla sabah gurmeleri için ideal.',
      specialties: ['Beyran Çorbası', 'Simit Kebabı'],
      speedScore: 3.9,
      cleanlinessScore: 4.1,
      valueScore: 4.7,
      priceLevel: '₺₺',
      heroImage:
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 37.0581,
        longitude: 37.3832,
      },
    },
    {
      id: 'place-izmir-1',
      cityId: 'city-izmir',
      districtId: 'district-konak',
      name: 'Deniz Restaurant',
      summary: 'İzmir Körfezi manzarasında günlük deniz mahsulleri tadımı.',
      specialties: ['Levrek Marin', 'Karides Güveç'],
      speedScore: 4.2,
      cleanlinessScore: 4.7,
      valueScore: 4.0,
      priceLevel: '₺₺₺',
      heroImage:
        'https://images.unsplash.com/photo-1514516430032-7d1001ac9280?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 38.4305,
        longitude: 27.1369,
      },
    },
    {
      id: 'place-izmir-2',
      cityId: 'city-izmir',
      districtId: 'district-konak',
      name: 'Tuzcuoğlu Fırın',
      summary: 'Boyoz ve gevrekle kahvaltı edenlerin sırrı; taş fırın lezzeti.',
      specialties: ['Boyoz', 'Gevrek'],
      speedScore: 4.8,
      cleanlinessScore: 4.4,
      valueScore: 4.6,
      priceLevel: '₺',
      heroImage:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      coordinates: {
        latitude: 38.4253,
        longitude: 27.1406,
      },
    },
  ],
  routes: [
    {
      id: 'route-istanbul-street-gems',
      cityId: 'city-istanbul',
      districtIds: ['district-beyoglu', 'district-kadikoy'],
      title: 'İstanbul Sokak Lezzetleri Rotası',
      description:
        'Karaköy’den Kadıköy’e uzanan rota; hızlı atıştırmalıklar ve ikonik tatlarla dolu bir gün.',
      coverImage:
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80',
      durationMinutes: 240,
      distanceKm: 7.5,
      tags: ['Sokak', 'Kokoreç', 'Kahve'],
      averageRating: 4.6,
      ratingCount: 128,
      author: {
        id: 'user-ece',
        name: 'Ece Gürsoy',
        title: 'Şehir Gurmesi',
        avatarSeed: 'ece',
      },
      stops: [
        {
          order: 1,
          placeId: 'place-istanbul-1',
          tastingNotes: ['Tereyağlı döner dürüm', 'Turşu suyu'],
          highlight: 'Öğle öncesi erken başlangıç; sıra beklemeden servis.',
          dwellMinutes: 30,
        },
        {
          order: 2,
          placeId: 'place-istanbul-2',
          tastingNotes: ['Günlük mezeler', 'Antep usulü tatlılar'],
          highlight: 'Paylaşımlı masa kültürüyle zengin tat deneyimi.',
          dwellMinutes: 90,
        },
        {
          order: 3,
          placeId: 'place-istanbul-3',
          tastingNotes: ['Köpüklü kahve', 'Geleneksel lokum'],
          highlight: 'Günün finali için sakin bir kahve molası.',
          dwellMinutes: 30,
        },
      ],
    },
    {
      id: 'route-gaziantep-kebap-sweet',
      cityId: 'city-gaziantep',
      districtIds: ['district-sahinbey'],
      title: 'Gaziantep Kebap & Tatlı Rotası',
      description: 'Sabah beyranla başlayıp akşam katmerle biten, otantik Antep ziyafeti.',
      coverImage:
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80',
      durationMinutes: 300,
      distanceKm: 4.2,
      tags: ['Kebap', 'Tatlı', 'Yöresel'],
      averageRating: 4.8,
      ratingCount: 86,
      author: {
        id: 'user-hasan',
        name: 'Hasan Kurt',
        title: 'Yerel Uzman',
        avatarSeed: 'hasan',
      },
      stops: [
        {
          order: 1,
          placeId: 'place-gaziantep-2',
          tastingNotes: ['Beyran çorbası', 'Acılı lahmacun'],
          highlight: 'Sabah 07:00 servisinde taze hazırlanan beyran.',
          dwellMinutes: 45,
        },
        {
          order: 2,
          placeId: 'place-gaziantep-1',
          tastingNotes: ['Ali Nazik', 'Soğuk ayran'],
          highlight: 'Geleneksel taş fırında pişen kebaplar.',
          dwellMinutes: 90,
        },
      ],
    },
    {
      id: 'route-izmir-breakfast-coast',
      cityId: 'city-izmir',
      districtIds: ['district-konak'],
      title: 'İzmir Sahil Kahvaltısı Rotası',
      description: 'Boyozdan deniz mahsullerine uzanan, gün boyu hafif lezzet durakları.',
      coverImage:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80',
      durationMinutes: 210,
      distanceKm: 5.8,
      tags: ['Kahvaltı', 'Ege', 'Balık'],
      averageRating: 4.5,
      ratingCount: 54,
      author: {
        id: 'user-selin',
        name: 'Selin Aksoy',
        title: 'Brunch Avcısı',
        avatarSeed: 'selin',
      },
      stops: [
        {
          order: 1,
          placeId: 'place-izmir-2',
          tastingNotes: ['Boyoz', 'Gevrek', 'Tahini sos'],
          highlight: 'Sokak fırınında sıcak boyoz ile kahvaltıya başla.',
          dwellMinutes: 40,
        },
        {
          order: 2,
          placeId: 'place-izmir-1',
          tastingNotes: ['Levrek marin', 'Yerel beyaz şarap'],
          highlight: 'Öğlen saatlerinde deniz manzaralı keyifli bir mola.',
          dwellMinutes: 120,
        },
      ],
    },
  ],
};

export const featuredRouteIds = ['route-istanbul-street-gems', 'route-gaziantep-kebap-sweet'];

export const highlightedCityIds = ['city-istanbul', 'city-gaziantep', 'city-izmir'];
