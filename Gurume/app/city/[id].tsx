import React, { useMemo } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGurumeData } from '@/hooks/use-gurume-data';

export default function CityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCityById, getRoutesByCityId, getPlacesByCityId, data, getPlacesByDistrictId } = useGurumeData();

  const city = id ? getCityById(id) : undefined;

  const routes = useMemo(() => (city ? getRoutesByCityId(city.id) : []), [city, getRoutesByCityId]);
  const places = useMemo(() => (city ? getPlacesByCityId(city.id) : []), [city, getPlacesByCityId]);
  const districts = useMemo(
    () => (city ? data.districts.filter((district) => district.cityId === city.id) : []),
    [city, data.districts]
  );

  if (!city) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Şehir bulunamadı</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const topRatedPlaces = [...places]
    .sort((a, b) => b.valueScore + b.cleanlinessScore + b.speedScore - (a.valueScore + a.cleanlinessScore + a.speedScore))
    .slice(0, 4);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backLink} accessibilityRole="button">
        <ThemedText style={styles.backLinkText}>← Şehirlere dön</ThemedText>
      </Pressable>

      <ThemedView style={styles.heroCard}>
        <Image source={{ uri: city.heroImage }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <ThemedText type="title" style={styles.heroTitle}>
            {city.name}
          </ThemedText>
          <ThemedText style={styles.heroDescription}>{city.description}</ThemedText>
          <View style={styles.heroBadges}>
            <Badge label={`${districts.length} ilçe`} />
            <Badge label={`${places.length} mekan`} />
            <Badge label={`${routes.length} rota`} />
          </View>
          <View style={styles.heroTags}>
            {city.highlightTags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Öne Çıkan Rotalar</ThemedText>
        <View style={styles.routeList}>
          {routes.map((route) => (
            <Pressable
              key={route.id}
              onPress={() => router.push(`/route/${route.id}`)}
              style={styles.routeCard}
              accessibilityRole="button">
              <Image source={{ uri: route.coverImage }} style={styles.routeImage} />
              <View style={styles.routeContent}>
                <ThemedText style={styles.routeTitle}>{route.title}</ThemedText>
                <ThemedText style={styles.routeMeta}>
                  {route.stops.length} durak • ⭐ {route.averageRating.toFixed(1)} ({route.ratingCount})
                </ThemedText>
                <View style={styles.routeTags}>
                  {route.tags.slice(0, 3).map((tag) => (
                    <MiniTag key={tag} label={tag} />
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">En Sevilen Mekanlar</ThemedText>
        <View style={styles.placeGrid}>
          {topRatedPlaces.map((place) => (
            <View key={place.id} style={styles.placeCard}>
              <Image source={{ uri: place.heroImage }} style={styles.placeImage} />
              <View style={styles.placeContent}>
                <ThemedText style={styles.placeName}>{place.name}</ThemedText>
                <ThemedText style={styles.placeSummary}>{place.summary}</ThemedText>
                <View style={styles.placeScores}>
                  <Score label="Hız" value={place.speedScore} />
                  <Score label="Temizlik" value={place.cleanlinessScore} />
                  <Score label="Fiyat" value={place.valueScore} />
                </View>
                <ThemedText style={styles.placeSpecialties}>
                  Önerilen: {place.specialties.slice(0, 3).join(', ')}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">İlçeler</ThemedText>
        <View style={styles.districtList}>
          {districts.map((district) => (
            <View key={district.id} style={styles.districtCard}>
              <ThemedText style={styles.districtName}>{district.name}</ThemedText>
              <ThemedText style={styles.districtCount}>
                {getPlacesByDistrictId(district.id).length} mekan
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <ThemedText style={styles.badgeText}>{label}</ThemedText>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <ThemedText style={styles.tagText}>#{label}</ThemedText>
    </View>
  );
}

function MiniTag({ label }: { label: string }) {
  return (
    <View style={styles.miniTag}>
      <ThemedText style={styles.miniTagText}>{label}</ThemedText>
    </View>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.score}>
      <ThemedText style={styles.scoreLabel}>{label}</ThemedText>
      <ThemedText style={styles.scoreValue}>{value.toFixed(1)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  backButton: {
    backgroundColor: '#FFE0C9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
  },
  backButtonText: {
    fontWeight: '600',
  },
  backLink: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  backLinkText: {
    fontWeight: '600',
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    height: 220,
    width: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    gap: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
  },
  heroDescription: {
    color: '#FCE8DD',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  routeList: {
    gap: 16,
  },
  routeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F5CBB0',
  },
  routeImage: {
    height: 140,
    width: '100%',
  },
  routeContent: {
    padding: 16,
    gap: 8,
  },
  routeTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  routeMeta: {
    color: '#8C6F60',
  },
  routeTags: {
    flexDirection: 'row',
    gap: 6,
  },
  placeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  placeCard: {
    flexBasis: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE0C9',
    backgroundColor: '#FFF9F2',
  },
  placeImage: {
    height: 120,
    width: '100%',
  },
  placeContent: {
    padding: 14,
    gap: 8,
  },
  placeName: {
    fontWeight: '600',
  },
  placeSummary: {
    color: '#8C6F60',
    fontSize: 13,
    lineHeight: 18,
  },
  placeScores: {
    flexDirection: 'row',
    gap: 8,
  },
  placeSpecialties: {
    fontSize: 12,
    color: '#8C6F60',
  },
  districtList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  districtCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFE9DB',
  },
  districtName: {
    fontWeight: '600',
  },
  districtCount: {
    fontSize: 12,
    color: '#8C6F60',
  },
  badge: {
    backgroundColor: '#FFE0C9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '600',
  },
  tag: {
    backgroundColor: '#FFDCC5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontWeight: '600',
  },
  miniTag: {
    backgroundColor: '#FFF2E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  miniTagText: {
    fontSize: 12,
    color: '#8C6F60',
  },
  score: {
    backgroundColor: '#FFE9DB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreValue: {
    fontWeight: '600',
  },
});
