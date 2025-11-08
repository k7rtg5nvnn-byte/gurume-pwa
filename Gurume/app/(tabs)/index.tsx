/**
 * ANA EKRAN
 * 
 * - Puana göre sıralı top rotalar
 * - Şehir bazlı rota önerileri
 * - Trending rotalar
 * - Auth kontrolü
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View, RefreshControl } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { routesService } from '@/services/routes.service';
import { turkeyCities } from '@/data/turkey-cities-districts';
import type { Route } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { user } = useAuth();

  const [topRatedRoutes, setTopRatedRoutes] = useState<Route[]>([]);
  const [trendingRoutes, setTrendingRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // İlk top 3 şehir
  const highlightedCities = turkeyCities.slice(0, 3);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      // Top rated routes (puana göre sıralı)
      const topRated = await routesService.getAllRoutes({ sortBy: 'rating' });
      setTopRatedRoutes(topRated.slice(0, 5));

      // Trending routes (view count + rating kombinasyonu)
      const trending = await routesService.getAllRoutes({ sortBy: 'popular' });
      setTrendingRoutes(trending.slice(0, 5));
    } catch (error) {
      console.error('loadRoutes error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRoutes();
  };

  const handleAuthAction = () => {
    if (!user) {
      router.push('/auth/login');
    } else {
      router.push('/(tabs)/create');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        <ThemedText style={{ marginTop: 16 }}>Rotalar yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Hero Section */}
      <ThemedView style={[styles.heroCard, { borderColor: Colors[colorScheme].border }]}>
        <View style={styles.heroContent}>
          <ThemedText type="title" style={styles.heroTitle}>
            Gurume
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Türkiye&apos;yi lezzet rotalarıyla keşfet. Yerel gurmelerin önerdiği duraklarla hemen başla.
          </ThemedText>
          {user && (
            <ThemedText style={styles.welcomeText}>
              Hoş geldin, {user.username}! 👋
            </ThemedText>
          )}
          <View style={styles.heroActions}>
            <Pressable
              style={[styles.ctaButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={handleAuthAction}>
              <ThemedText style={styles.ctaLabel} lightColor="#FFFFFF" darkColor="#1D1411">
                {user ? 'Rota Oluştur' : 'Hemen Başla'}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: Colors[colorScheme].primary }]}
              onPress={() => router.push('/(tabs)/explore')}>
              <ThemedText
                style={styles.secondaryLabel}
                lightColor={Colors.light.primary}
                darkColor={Colors.dark.primary}>
                Keşfet
              </ThemedText>
            </Pressable>
          </View>
        </View>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.heroImage}
        />
      </ThemedView>

      {/* Top Rated Rotalar */}
      {topRatedRoutes.length > 0 && (
        <Section
          title="En Yüksek Puanlı Rotalar"
          subtitle="Kullanıcıların en çok beğendiği lezzet yolculukları"
          data={topRatedRoutes}
          renderItem={(route) => (
            <RouteCard
              key={route.id}
              route={route}
              colorScheme={colorScheme}
              onPress={() => router.push(`/route/${route.id}`)}
            />
          )}
        />
      )}

      {/* Şehirler */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Popüler Şehirler</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          İl/ilçe bazlı rotaları keşfet ve favorilerini kaydet
        </ThemedText>
      </ThemedView>
      <FlatList
        data={highlightedCities}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityList}
        ItemSeparatorComponent={() => <View style={styles.citySeparator} />}
        renderItem={({ item }) => (
          <CityCard
            city={item}
            colorScheme={colorScheme}
            onPress={() => router.push(`/city/${item.id}`)}
          />
        )}
      />

      {/* Trending Rotalar */}
      {trendingRoutes.length > 0 && (
        <Section
          title="Trend Rotalar"
          subtitle="Bu hafta en çok görüntülenen lezzet rotaları"
          data={trendingRoutes}
          renderItem={(route) => (
            <RouteCompact
              key={route.id}
              route={route}
              colorScheme={colorScheme}
              onPress={() => router.push(`/route/${route.id}`)}
            />
          )}
        />
      )}
    </ScrollView>
  );
}

type SectionProps<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
};

function Section<T>({ title, subtitle, data, renderItem }: SectionProps<T>) {
  if (!data.length) {
    return null;
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {subtitle ? <ThemedText style={styles.sectionDescription}>{subtitle}</ThemedText> : null}
      <View style={styles.sectionContent}>{data.map((item, index) => renderItem(item, index))}</View>
    </ThemedView>
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
  const stopCount = route.stops?.length || 0;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView style={[styles.routeCard, { borderColor: Colors[colorScheme].border }]}>
        <Image source={{ uri: route.coverImage }} style={styles.routeImage} />
        <View style={styles.routeContent}>
          <View style={styles.routeHeader}>
            <ThemedText type="subtitle" style={styles.routeTitle}>
              {route.title}
            </ThemedText>
            <View style={styles.ratingBadge}>
              <ThemedText style={styles.routeRating}>
                ⭐ {route.averageRating.toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>({route.ratingCount})</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.routeDescription} numberOfLines={2}>
            {route.description}
          </ThemedText>
          <View style={styles.routeMetaRow}>
            <MetaPill label={`${stopCount} durak`} colorScheme={colorScheme} />
            <MetaPill label={`${Math.round(route.distanceKm)} km`} colorScheme={colorScheme} />
            <MetaPill label={`${route.durationMinutes} dk`} colorScheme={colorScheme} />
          </View>
          <View style={styles.routeFooter}>
            <View style={styles.authorInfo}>
              <ThemedText style={styles.authorName}>@{route.author.username}</ThemedText>
              {route.author.isVerified && <ThemedText>✓</ThemedText>}
            </View>
            <View style={styles.tagRow}>
              {route.tags.slice(0, 2).map((tag) => (
                <Tag key={tag} label={tag} colorScheme={colorScheme} />
              ))}
            </View>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function RouteCompact({
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
      <ThemedView style={[styles.routeCompact, { borderColor: Colors[colorScheme].border }]}>
        <Image source={{ uri: route.coverImage }} style={styles.routeCompactImage} />
        <View style={styles.routeCompactContent}>
          <ThemedText style={styles.routeCompactTitle} numberOfLines={1}>
            {route.title}
          </ThemedText>
          <ThemedText style={styles.routeCompactMeta}>
            {route.stops?.length || 0} durak • ⭐ {route.averageRating.toFixed(1)} ({route.ratingCount})
          </ThemedText>
          <View style={styles.compactTagRow}>
            {route.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} colorScheme={colorScheme} compact />
            ))}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function CityCard({
  city,
  colorScheme,
  onPress,
}: {
  city: any;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView style={[styles.cityCard, { borderColor: Colors[colorScheme].border }]}>
        <Image source={{ uri: city.heroImage }} style={styles.cityImage} />
        <View style={styles.cityContent}>
          <ThemedText type="subtitle">{city.name}</ThemedText>
          <ThemedText style={styles.cityDescription} numberOfLines={2}>
            {city.description}
          </ThemedText>
          <View style={styles.tagRow}>
            {city.highlightTags.slice(0, 2).map((tag: string) => (
              <Tag key={tag} label={tag} colorScheme={colorScheme} compact />
            ))}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function MetaPill({ label, colorScheme }: { label: string; colorScheme: 'light' | 'dark' }) {
  return (
    <View style={[styles.metaPill, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
      <ThemedText style={styles.metaPillText}>{label}</ThemedText>
    </View>
  );
}

function Tag({
  label,
  colorScheme,
  compact = false,
}: {
  label: string;
  colorScheme: 'light' | 'dark';
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: Colors[colorScheme].badgeYellow,
          borderColor: Colors[colorScheme].accent,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
        },
      ]}>
      <ThemedText
        style={[styles.tagText, { fontSize: compact ? 11 : 12 }]}
        lightColor={Colors.light.textSecondary}
        darkColor={Colors.dark.textSecondary}>
        #{label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 16,
  },
  heroContent: {
    flex: 1,
    gap: 12,
  },
  heroTitle: {
    fontSize: 40,
  },
  heroSubtitle: {
    lineHeight: 24,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  ctaButton: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryLabel: {
    fontWeight: '700',
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  section: {
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 24,
  },
  sectionDescription: {
    lineHeight: 22,
  },
  sectionContent: {
    gap: 16,
  },
  routeCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  routeImage: {
    height: 180,
  },
  routeContent: {
    padding: 16,
    gap: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 20,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeRating: {
    fontWeight: '700',
    fontSize: 16,
  },
  ratingCount: {
    fontSize: 12,
  },
  routeDescription: {
    lineHeight: 22,
  },
  routeMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cityList: {
    paddingHorizontal: 20,
  },
  citySeparator: {
    width: 16,
  },
  cityCard: {
    width: 260,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cityImage: {
    height: 130,
    width: '100%',
  },
  cityContent: {
    padding: 16,
    gap: 8,
  },
  cityDescription: {
    lineHeight: 20,
    fontSize: 14,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
  },
  tagText: {
    fontWeight: '600',
  },
  routeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
  },
  routeCompactImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  routeCompactContent: {
    flex: 1,
    gap: 4,
  },
  routeCompactTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeCompactMeta: {
    fontSize: 12,
  },
  compactTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
});
