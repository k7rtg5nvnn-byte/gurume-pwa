/**
 * ŞEHİR DETAY EKRANI
 * 
 * Belirli bir şehirdeki tüm rotaları gösterir
 * - Şehir bilgisi
 * - Şehre ait rotalar
 * - Puana göre sıralı
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { mockRoutes } from '@/data/mock-routes';
import type { Route } from '@/types';

export default function CityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const city = turkeyCities.find(c => c.id === id);

  useEffect(() => {
    if (id) {
      loadCityRoutes();
    }
  }, [id]);

  const loadCityRoutes = async () => {
    try {
      // İl bazlı rotaları getir
      const cityRoutes = mockRoutes
        .filter(route => route.cityId === id)
        .sort((a, b) => b.averageRating - a.averageRating);
      
      setRoutes(cityRoutes);
    } catch (error) {
      console.error('loadCityRoutes error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </ThemedView>
    );
  }

  if (!city) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Şehir bulunamadı.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image source={{ uri: city.heroImage }} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <ThemedText type="title" style={styles.heroTitle}>
            {city.name}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            {routes.length} Rota • {city.highlightTags.join(' • ')}
          </ThemedText>
        </View>
      </View>

      {/* City Info */}
      <ThemedView style={styles.infoSection}>
        <ThemedText style={styles.description}>{city.description}</ThemedText>
        
        {city.signatureDishes.length > 0 && (
          <View style={styles.dishesSection}>
            <ThemedText style={styles.dishesTitle}>Öne Çıkan Lezzetler:</ThemedText>
            <View style={styles.dishes}>
              {city.signatureDishes.map((dish, index) => (
                <View
                  key={index}
                  style={[
                    styles.dish,
                    {
                      backgroundColor: Colors[colorScheme].badgeYellow,
                      borderColor: Colors[colorScheme].accent,
                    },
                  ]}>
                  <ThemedText style={styles.dishText}>{dish}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ThemedView>

      {/* Routes */}
      <ThemedView style={styles.routesSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {city.name} Rotaları ({routes.length})
        </ThemedText>

        {routes.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Henüz {city.name} için rota eklenmemiş.
            </ThemedText>
            <ThemedText style={styles.emptyHint}>
              İlk rotayı siz oluşturabilirsiniz!
            </ThemedText>
            <Pressable
              style={[styles.createButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={() => router.push('/(tabs)/create')}>
              <ThemedText style={styles.createButtonText} lightColor="#FFFFFF">
                Rota Oluştur
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={routes}
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
            <ThemedText style={styles.metaText}>
              ({route.ratingCount} değerlendirme)
            </ThemedText>
          </View>

          <View style={styles.routeFooter}>
            <ThemedText style={styles.authorText}>@{route.author.username}</ThemedText>
            {route.isVerified && <ThemedText style={styles.verifiedBadge}>✓ Doğrulanmış</ThemedText>}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heroTitle: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
  },
  infoSection: {
    padding: 20,
    gap: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  dishesSection: {
    gap: 12,
  },
  dishesTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dishes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dish: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dishText: {
    fontSize: 14,
    fontWeight: '600',
  },
  routesSection: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  createButtonText: {
    fontWeight: '700',
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
    gap: 8,
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
    alignItems: 'center',
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
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
