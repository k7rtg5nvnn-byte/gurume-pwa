import React, { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { mockData } from '@/data/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const colorScheme = useColorScheme() ?? 'light';

  const stats = useMemo(() => {
    return mockData.cities.map((city) => {
      const places = mockData.places.filter((place) => place.cityId === city.id);
      const districts = mockData.districts.filter((district) => district.cityId === city.id);
      const routes = mockData.routes.filter((route) => route.cityId === city.id);

      return {
        cityId: city.id,
        placeCount: places.length,
        districtCount: districts.length,
        routeCount: routes.length,
      };
    });
  }, []);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) {
      return mockData.cities;
    }

    const lowered = searchTerm.toLowerCase();
    const matchingCityIds = new Set<string>();

    mockData.cities.forEach((city) => {
      if (city.name.toLowerCase().includes(lowered)) {
        matchingCityIds.add(city.id);
      }
    });

    mockData.districts.forEach((district) => {
      if (district.name.toLowerCase().includes(lowered)) {
        matchingCityIds.add(district.cityId);
      }
    });

    mockData.places.forEach((place) => {
      if (place.name.toLowerCase().includes(lowered)) {
        matchingCityIds.add(place.cityId);
      }
    });

    return mockData.cities.filter((city) => matchingCityIds.has(city.id));
  }, [searchTerm]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Türkiye Lezzet Haritası</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Şehir, ilçe veya mekan adı yaz; topluluğun önerdiği rotaları keşfet.
        </ThemedText>
        <View style={[styles.searchContainer, { borderColor: Colors[colorScheme].tabIconDefault }]}>
          <TextInput
            placeholder="Şehir, ilçe veya mekan ara"
            placeholderTextColor="#C9A793"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.summaryRow}>
        {stats.map((item) => {
          const city = mockData.cities.find((c) => c.id === item.cityId);
          if (!city) return null;

          return (
            <View key={city.id} style={styles.summaryCard}>
              <ThemedText type="subtitle" style={styles.summaryCity}>
                {city.name}
              </ThemedText>
              <ThemedText style={styles.summaryMetrics}>
                {item.districtCount} ilçe • {item.placeCount} mekan • {item.routeCount} rota
              </ThemedText>
            </View>
          );
        })}
      </ThemedView>

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Şehir Bazlı Rotayı Bul</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          İlçeleri ve önerilen mekanları incele, rotaya eklemek için favorilerini seç.
        </ThemedText>
      </ThemedView>

      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cityList}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        renderItem={({ item }) => (
          <CityDetailCard
            key={item.id}
            cityId={item.id}
            colorScheme={colorScheme}
            showAllDistricts={filteredCities.length === 1}
          />
        )}
      />

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Topluluk Rotaları</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Kullanıcıların yeni paylaştığı rotalar ve önerilen tatlar.
        </ThemedText>
      </ThemedView>

      <View style={styles.routeGrid}>
        {mockData.routes.map((route) => (
          <ThemedView key={route.id} style={styles.routeTile}>
            <Image source={{ uri: route.coverImage }} style={styles.routeTileImage} />
            <View style={styles.routeTileContent}>
              <ThemedText style={styles.routeTileTitle}>{route.title}</ThemedText>
              <ThemedText style={styles.routeTileMeta}>
                {route.stops.length} durak • ⭐ {route.averageRating.toFixed(1)} ({route.ratingCount})
              </ThemedText>
            </View>
          </ThemedView>
        ))}
      </View>
    </ScrollView>
  );
}

function CityDetailCard({
  cityId,
  colorScheme,
  showAllDistricts,
}: {
  cityId: string;
  colorScheme: 'light' | 'dark';
  showAllDistricts: boolean;
}) {
  const city = mockData.cities.find((item) => item.id === cityId);
  if (!city) return null;

  const districts = mockData.districts.filter((district) => district.cityId === city.id);
  const places = mockData.places.filter((place) => place.cityId === city.id);
  const samplePlaces = places.slice(0, 3);

  return (
    <ThemedView
      style={[
        styles.cityDetailCard,
        {
          borderColor: Colors[colorScheme].tabIconDefault,
        },
      ]}>
      <Image source={{ uri: city.heroImage }} style={styles.cityDetailImage} />
      <View style={styles.cityDetailContent}>
        <ThemedText type="subtitle" style={styles.cityDetailTitle}>
          {city.name}
        </ThemedText>
        <ThemedText style={styles.cityDetailDescription}>{city.description}</ThemedText>
        <View style={styles.cityDetailStats}>
          <InfoBadge label={`${districts.length} ilçe`} />
          <InfoBadge label={`${places.length} mekan`} />
          <InfoBadge label={`${mockData.routes.filter((route) => route.cityId === city.id).length} rota`} />
        </View>
        <View style={styles.districtList}>
          {(showAllDistricts ? districts : districts.slice(0, 3)).map((district) => (
            <View key={district.id} style={styles.districtItem}>
              <ThemedText style={styles.districtTitle}>{district.name}</ThemedText>
              <ThemedText style={styles.districtSubtitle}>
                {places.filter((place) => place.districtId === district.id).length} mekan
              </ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.samplePlaces}>
          {samplePlaces.map((place) => (
            <View key={place.id} style={styles.samplePlaceItem}>
              <ThemedText style={styles.samplePlaceName}>{place.name}</ThemedText>
              <ThemedText style={styles.samplePlaceNotes}>{place.specialties.join(', ')}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

function InfoBadge({ label }: { label: string }) {
  return (
    <View style={styles.infoBadge}>
      <ThemedText style={styles.infoBadgeText}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  headerSubtitle: {
    lineHeight: 22,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  summaryRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryCard: {
    flexBasis: '48%',
    minWidth: 150,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFE9DB',
    gap: 6,
  },
  summaryCity: {
    fontSize: 18,
  },
  summaryMetrics: {
    fontSize: 14,
    color: '#8C6F60',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 6,
  },
  sectionDescription: {
    color: '#8C6F60',
    lineHeight: 20,
  },
  cityList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },
  listSeparator: {
    height: 20,
  },
  cityDetailCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cityDetailImage: {
    height: 160,
    width: '100%',
  },
  cityDetailContent: {
    padding: 18,
    gap: 12,
  },
  cityDetailTitle: {
    fontSize: 22,
  },
  cityDetailDescription: {
    lineHeight: 20,
  },
  cityDetailStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  districtList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  districtItem: {
    borderRadius: 16,
    backgroundColor: '#FDE6DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  districtTitle: {
    fontWeight: '600',
  },
  districtSubtitle: {
    fontSize: 12,
    color: '#8C6F60',
  },
  samplePlaces: {
    gap: 10,
  },
  samplePlaceItem: {
    borderRadius: 14,
    backgroundColor: '#FFF2E8',
    padding: 12,
    gap: 4,
  },
  samplePlaceName: {
    fontWeight: '600',
  },
  samplePlaceNotes: {
    fontSize: 13,
    color: '#8C6F60',
  },
  infoBadge: {
    backgroundColor: '#FFE0C9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 12,
    marginBottom: 32,
  },
  routeTile: {
    flexBasis: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F5CBB0',
  },
  routeTileImage: {
    height: 120,
    width: '100%',
  },
  routeTileContent: {
    padding: 12,
    gap: 4,
  },
  routeTileTitle: {
    fontWeight: '600',
  },
  routeTileMeta: {
    fontSize: 12,
    color: '#8C6F60',
  },
});
