/**
 * KEŞFET EKRANI - TAM ÇALIŞIR VERSİYON
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { mockRoutes } from '@/data/mock-routes';
import type { Route } from '@/types';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest'>('rating');

  useEffect(() => {
    loadRoutes();
  }, [selectedCityId, minRating, sortBy]);

  const loadRoutes = () => {
    setLoading(true);
    
    let filteredData = [...mockRoutes];

    if (selectedCityId) {
      filteredData = filteredData.filter(route => route.cityId === selectedCityId);
    }

    if (minRating > 0) {
      filteredData = filteredData.filter(route => route.averageRating >= minRating);
    }

    if (sortBy === 'rating') {
      filteredData.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'popular') {
      filteredData.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === 'newest') {
      filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setRoutes(filteredData);
    setLoading(false);
  };

  const filteredRoutes = routes.filter((route) => {
    if (!searchTerm.trim()) return true;
    const lowered = searchTerm.toLowerCase();
    return (
      route.title.toLowerCase().includes(lowered) ||
      route.description.toLowerCase().includes(lowered) ||
      route.tags.some((tag) => tag.toLowerCase().includes(lowered))
    );
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Keşfet</ThemedText>
        <ThemedText style={styles.subtitle}>
          Türkiye&apos;nin en iyi lezzet rotalarını keşfet
        </ThemedText>

        <View style={[styles.searchContainer, { borderColor: Colors[colorScheme].border }]}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder="Rota ara..."
            placeholderTextColor={Colors[colorScheme].textLight}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.filtersSection}>
        <ThemedText style={styles.filtersTitle}>Filtrele</ThemedText>

        <View style={styles.filterItem}>
          <ThemedText style={styles.filterLabel}>Şehir</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cityButtons}>
              <Pressable
                style={[
                  styles.cityButton,
                  !selectedCityId && { backgroundColor: Colors[colorScheme].primary },
                  { borderColor: Colors[colorScheme].border },
                ]}
                onPress={() => setSelectedCityId('')}>
                <ThemedText
                  style={styles.cityButtonText}
                  lightColor={!selectedCityId ? '#FFFFFF' : Colors.light.text}
                  darkColor={!selectedCityId ? '#1D1411' : Colors.dark.text}>
                  Tümü
                </ThemedText>
              </Pressable>
              {turkeyCities.slice(0, 15).map((city) => (
                <Pressable
                  key={city.id}
                  style={[
                    styles.cityButton,
                    selectedCityId === city.id && { backgroundColor: Colors[colorScheme].primary },
                    { borderColor: Colors[colorScheme].border },
                  ]}
                  onPress={() => setSelectedCityId(city.id)}>
                  <ThemedText
                    style={styles.cityButtonText}
                    lightColor={selectedCityId === city.id ? '#FFFFFF' : Colors.light.text}
                    darkColor={selectedCityId === city.id ? '#1D1411' : Colors.dark.text}>
                    {city.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterItem}>
          <ThemedText style={styles.filterLabel}>Min Puan</ThemedText>
          <View style={styles.ratingButtons}>
            {[0, 3, 4, 4.5].map((rating) => (
              <Pressable
                key={rating}
                style={[
                  styles.ratingButton,
                  minRating === rating && { backgroundColor: Colors[colorScheme].primary },
                  { borderColor: Colors[colorScheme].border },
                ]}
                onPress={() => setMinRating(rating)}>
                <ThemedText
                  style={styles.ratingButtonText}
                  lightColor={minRating === rating ? '#FFFFFF' : Colors.light.text}
                  darkColor={minRating === rating ? '#1D1411' : Colors.dark.text}>
                  {rating === 0 ? 'Tümü' : `${rating}+`}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterItem}>
          <ThemedText style={styles.filterLabel}>Sıralama</ThemedText>
          <View style={styles.sortButtons}>
            {[
              { key: 'rating', label: 'Puana Göre' },
              { key: 'popular', label: 'Popüler' },
              { key: 'newest', label: 'Yeni' },
            ].map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.sortButton,
                  sortBy === option.key && { backgroundColor: Colors[colorScheme].primary },
                  { borderColor: Colors[colorScheme].border },
                ]}
                onPress={() => setSortBy(option.key as any)}>
                <ThemedText
                  style={styles.sortButtonText}
                  lightColor={sortBy === option.key ? '#FFFFFF' : Colors.light.text}
                  darkColor={sortBy === option.key ? '#1D1411' : Colors.dark.text}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.resultsSection}>
        <ThemedText style={styles.resultsTitle}>
          Sonuçlar ({filteredRoutes.length})
        </ThemedText>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          </View>
        ) : filteredRoutes.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Rota bulunamadı.</ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredRoutes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RouteCard
                route={item}
                colorScheme={colorScheme}
                onPress={() => router.push(`/route/${item.id}`)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        )}
      </ThemedView>
    </ScrollView>
  );
}

function RouteCard({
  route,
  colorScheme,
  onPress,
}: {
  route: Route;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View style={[styles.routeCard, { borderColor: Colors[colorScheme].border }]}>
        <Image source={{ uri: route.coverImage }} style={styles.routeImage} />
        <View style={styles.routeContent}>
          <View style={styles.routeHeader}>
            <ThemedText style={styles.routeTitle} numberOfLines={1}>
              {route.title}
            </ThemedText>
            <View style={styles.ratingBadge}>
              <ThemedText style={styles.routeRating}>⭐ {route.averageRating.toFixed(1)}</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.routeDesc} numberOfLines={2}>
            {route.description}
          </ThemedText>

          <View style={styles.routeMeta}>
            <ThemedText style={styles.metaText}>
              📍 {route.stops?.length || 0} durak
            </ThemedText>
            <ThemedText style={styles.metaText}>⏱️ {route.durationMinutes} dk</ThemedText>
          </View>

          <View style={styles.routeFooter}>
            <ThemedText style={styles.authorText}>@{route.author.username}</ThemedText>
            {route.isVerified && <ThemedText style={styles.verifiedBadge}>✓</ThemedText>}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  subtitle: {
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterItem: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  cityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cityButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  separator: {
    height: 16,
  },
  routeCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    gap: 12,
    padding: 12,
  },
  routeImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  routeContent: {
    flex: 1,
    gap: 6,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
  },
  routeRating: {
    fontSize: 14,
    fontWeight: '700',
  },
  routeDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#4CAF50',
  },
});
