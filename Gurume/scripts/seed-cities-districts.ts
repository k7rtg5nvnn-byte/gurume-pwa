/**
 * SEED SCRIPT: Cities & Districts
 * 
 * Türkiye'nin 81 ilini ve 973 ilçesini Supabase'e yükler
 */

import { createClient } from '@supabase/supabase-js';
import { turkeyCities } from '../data/turkey-cities-districts';
import * as fs from 'fs';
import * as path from 'path';

// .env dosyasını manuel olarak yükle
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

// .env'den Supabase config
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ HATA: .env dosyasında Supabase bilgileri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCitiesAndDistricts() {
  try {
    console.log('🚀 Seed işlemi başlatılıyor...\n');

    // 1. Önce districts'i temizle (foreign key constraint)
    console.log('🗑️  Districts tablosu temizleniyor...');
    const { error: deleteDistrictsError } = await supabase
      .from('districts')
      .delete()
      .neq('id', '00-00'); // Tümünü sil

    if (deleteDistrictsError) {
      console.warn('⚠️  Districts silinemedi (table boş olabilir):', deleteDistrictsError.message);
    } else {
      console.log('✅ Districts temizlendi');
    }

    // 2. Cities'i temizle
    console.log('🗑️  Cities tablosu temizleniyor...');
    const { error: deleteCitiesError } = await supabase
      .from('cities')
      .delete()
      .neq('id', '00'); // Tümünü sil

    if (deleteCitiesError) {
      console.warn('⚠️  Cities silinemedi (table boş olabilir):', deleteCitiesError.message);
    } else {
      console.log('✅ Cities temizlendi');
    }

    console.log();

    // 3. Cities'i ekle
    console.log('🏙️  81 İl ekleniyor...');
    
    const citiesData = turkeyCities.map(city => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      region: 'Türkiye', // Varsayılan bölge
      latitude: 0, // Placeholder
      longitude: 0, // Placeholder
    }));

    const { data: insertedCities, error: citiesError } = await supabase
      .from('cities')
      .insert(citiesData)
      .select();

    if (citiesError) {
      console.error('❌ Cities eklenirken hata:', citiesError);
      throw citiesError;
    }

    console.log(`✅ ${insertedCities?.length || 81} İl başarıyla eklendi!\n`);

    // 4. Districts'i ekle (batch olarak)
    console.log('🏘️  973 İlçe ekleniyor...');
    
    let totalDistricts = 0;
    const batchSize = 100; // Her seferde 100 ilçe

    for (const city of turkeyCities) {
      const districtsData = city.districts.map(district => ({
        id: district.id,
        city_id: city.id,
        name: district.name,
        slug: district.slug,
      }));

      // Batch batch ekle
      for (let i = 0; i < districtsData.length; i += batchSize) {
        const batch = districtsData.slice(i, i + batchSize);
        
        const { error: districtsError } = await supabase
          .from('districts')
          .insert(batch);

        if (districtsError) {
          console.error(`❌ ${city.name} ilçeleri eklenirken hata:`, districtsError);
          throw districtsError;
        }

        totalDistricts += batch.length;
      }

      process.stdout.write(`\r✅ ${totalDistricts} ilçe eklendi...`);
    }

    console.log(`\n✅ Toplam ${totalDistricts} ilçe başarıyla eklendi!\n`);

    // 5. Kontrol et
    const { count: citiesCount } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true });

    const { count: districtsCount } = await supabase
      .from('districts')
      .select('*', { count: 'exact', head: true });

    console.log('📊 SONUÇ:');
    console.log(`   🏙️  İller: ${citiesCount}`);
    console.log(`   🏘️  İlçeler: ${districtsCount}`);
    console.log('\n🎉 Seed işlemi tamamlandı!');

  } catch (error) {
    console.error('\n💥 Beklenmeyen hata:', error);
    process.exit(1);
  }
}

// Çalıştır
seedCitiesAndDistricts();
