import React from 'react';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { featuredRouteIds, highlightedCityIds } from '@/data/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGurumeData } from '@/hooks/use-gurume-data';
import { useAuth } from '@/hooks/use-auth';
import type { City, Coordinates, Route, RouteStop } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { data, getCityById, getPlaceById, toggleFavorite, favoriteRouteIds } = useGurumeData();
  const { profile } = useAuth();

  const [userLocation, setUserLocation] = React.useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = React.useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [nearbyRoutes, setNearbyRoutes] = React.useState<RouteWithDistance[]>([]);
  const notifiedRoutesRef = React.useRef<Set<string>>(new Set());

  const featuredRoutes = data.routes.filter((route) => featuredRouteIds.includes(route.id));
  const highlightedCities = data.cities.filter((city) => highlightedCityIds.includes(city.id));

  const requestLocationPermission = React.useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      setLocationStatus('granted');
      const current = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (error) {
      console.warn('[HomeScreen] location error', (error as Error).message);
      setLocationStatus('denied');
    }
  }, []);

  React.useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  React.useEffect(() => {
    async function ensureNotificationPermission() {
      const settings = await Notifications.getPermissionsAsync();
      if (!settings.granted && settings.status !== Notifications.PermissionStatus.PROVISIONAL) {
        await Notifications.requestPermissionsAsync();
      }
    }
    ensureNotificationPermission();
  }, []);

  React.useEffect(() => {
    if (!userLocation) return;

    const computed = data.routes
      .map((route) => ({
        route,
        distanceKm: calculateNearestDistance(route, userLocation, getPlaceById),
      }))
      .filter((item) => item.distanceKm !== null)
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .slice(0, 5) as RouteWithDistance[];

    setNearbyRoutes(computed);
  }, [data.routes, getPlaceById, userLocation]);

  React.useEffect(() => {
    if (!profile || !nearbyRoutes.length) return;

    nearbyRoutes.forEach((item) => {
      if (
        item.distanceKm !== null &&
        item.distanceKm <= 1.5 &&
        !notifiedRoutesRef.current.has(item.route.id)
      ) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Yakındaki Gurme Rotası',
            body: `${item.route.title} sadece ${item.distanceKm.toFixed(1)} km uzağında!`,
            data: { routeId: item.route.id },
          },
          trigger: null,
        }).catch((error) => console.warn('[HomeScreen] notification error', error.message));
        notifiedRoutesRef.current.add(item.route.id);
      }
    });
  }, [nearbyRoutes, profile]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.heroCard, { borderColor: Colors[colorScheme].tabIconDefault }]}>
        <View style={styles.heroContent}>
          <ThemedText type="title">Gurume</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Türkiye’yi lezzet rotalarıyla keşfet. Yerel gurmelerin önerdiği duraklarla hemen başla.
          </ThemedText>
          <View style={styles.heroActions}>
            <Pressable
              style={[styles.ctaButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/create')}>
              <ThemedText style={styles.ctaLabel} lightColor="#FFFFFF" darkColor="#1D1411">
                Rotanı Planla
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/explore')}>
              <ThemedText style={styles.secondaryLabel}>Şehirleri incele</ThemedText>
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

      <Section
        title="Öne Çıkan Rotalar"
        subtitle="Topluluğun favori lezzet kaçamakları"
        data={featuredRoutes}
        renderItem={(route) => (
          <RouteCard
            key={route.id}
            route={route}
            colorScheme={colorScheme}
            onPress={() => router.push(`/route/${route.id}`)}
            resolveCity={getCityById}
            onToggleFavorite={() => toggleFavorite(route.id)}
            isFavorite={favoriteRouteIds.includes(route.id)}
          />
        )}
      />

      {locationStatus === 'granted' && nearbyRoutes.length ? (
        <Section
          title="Yakınındaki Rotalar"
          subtitle="Konumuna en yakın lezzetleri keşfet"
          data={nearbyRoutes}
          renderItem={(item) => (
            <RouteNearbyCard
              key={item.route.id}
              value={item}
              colorScheme={colorScheme}
              onPress={() => router.push(`/route/${item.route.id}`)}
              resolveCity={getCityById}
              onToggleFavorite={() => toggleFavorite(item.route.id)}
              isFavorite={favoriteRouteIds.includes(item.route.id)}
            />
          )}
        />
      ) : locationStatus === 'denied' ? (
        <ThemedView style={styles.permissionCard}>
          <ThemedText type="subtitle">Konuma Göre Öneriler</ThemedText>
          <ThemedText style={styles.permissionCopy}>
            Yakınındaki rotaları görebilmek için konum iznini etkinleştir.
          </ThemedText>
          <Pressable
            style={[styles.permissionButton, { borderColor: Colors[colorScheme].tint }]}
            onPress={requestLocationPermission}>
            <ThemedText style={[styles.permissionButtonLabel, { color: Colors[colorScheme].tint }]}>
              İzni Yeniden Sor
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Şehir Seç ve Başla</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          İl/ilçe bazlı kürasyonlu listelerle hangi duraktan başlayacağını hemen bul.
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
            cityId={item.id}
            colorScheme={colorScheme}
            resolveCity={getCityById}
            onPress={() => router.push(`/city/${item.id}`)}
          />
        )}
      />

      <Section
        title="Toplulukta Popüler"
        subtitle="Son haftada en çok puanlanan rotalar"
        data={data.routes.slice(0, 3)}
        renderItem={(route) => (
          <RouteCompact
            key={route.id}
            route={route}
            colorScheme={colorScheme}
            onPress={() => router.push(`/route/${route.id}`)}
            resolveCity={getCityById}
            onToggleFavorite={() => toggleFavorite(route.id)}
            isFavorite={favoriteRouteIds.includes(route.id)}
          />
        )}
      />
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
  resolveCity,
  onToggleFavorite,
  isFavorite,
}: {
  route: Route;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
  resolveCity: (id: string) => City | undefined;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const city = resolveCity(route.cityId);
  const stopCount = route.stops.length;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
        <ThemedView
          style={[
            styles.routeCard,
            {
              borderColor: Colors[colorScheme].tabIconDefault,
            },
          ]}>
          <Image source={{ uri: route.coverImage }} style={styles.routeImage} />
          <Pressable onPress={onToggleFavorite} style={styles.routeFavoriteButton}>
            <ThemedText style={styles.routeFavoriteLabel}>{isFavorite ? '♥' : '♡'}</ThemedText>
          </Pressable>
          <View style={styles.routeContent}>
            <View style={styles.routeHeader}>
              <ThemedText type="subtitle" style={styles.routeTitle}>
                {route.title}
              </ThemedText>
              <ThemedText style={styles.routeRating}>
                ⭐ {route.averageRating.toFixed(1)} ({route.ratingCount})
              </ThemedText>
            </View>
            <ThemedText style={styles.routeDescription}>{route.description}</ThemedText>
            <View style={styles.routeMetaRow}>
              <MetaPill label={city?.name ?? 'Bilinmiyor'} />
              <MetaPill label={`${stopCount} durak`} />
              <MetaPill
                label={
                  typeof route.distanceKm === 'number'
                    ? `${Math.round(route.distanceKm)} km`
                    : 'Mesafe belirsiz'
                }
              />
            </View>
            <View style={styles.tagRow}>
              {route.tags.map((tag) => (
                <Tag key={tag} label={tag} colorScheme={colorScheme} />
              ))}
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
  resolveCity,
  onToggleFavorite,
  isFavorite,
}: {
  route: Route;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
  resolveCity: (id: string) => City | undefined;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const city = resolveCity(route.cityId);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
        <ThemedView style={styles.routeCompact}>
          <Image source={{ uri: route.coverImage }} style={styles.routeCompactImage} />
          <View style={styles.routeCompactContent}>
            <ThemedText style={styles.routeCompactTitle}>{route.title}</ThemedText>
            <ThemedText style={styles.routeCompactMeta}>
              {city?.name} • {route.stops.length} durak • ⭐ {route.averageRating.toFixed(1)}
            </ThemedText>
            <View style={styles.compactTagRow}>
              {route.tags.slice(0, 2).map((tag) => (
                <Tag key={tag} label={tag} colorScheme={colorScheme} compact />
              ))}
            </View>
          </View>
          <Pressable onPress={onToggleFavorite} style={styles.compactFavoriteButton}>
            <ThemedText style={styles.compactFavoriteLabel}>{isFavorite ? '♥' : '♡'}</ThemedText>
          </Pressable>
        </ThemedView>
    </Pressable>
  );
}

function RouteNearbyCard({
  value,
  colorScheme,
  onPress,
  resolveCity,
  onToggleFavorite,
  isFavorite,
}: {
  value: RouteWithDistance;
  colorScheme: 'light' | 'dark';
  onPress: () => void;
  resolveCity: (id: string) => City | undefined;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const city = resolveCity(value.route.cityId);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView style={styles.nearbyCard}>
        <Image source={{ uri: value.route.coverImage }} style={styles.nearbyImage} />
        <View style={styles.nearbyContent}>
          <ThemedText style={styles.nearbyTitle}>{value.route.title}</ThemedText>
          <ThemedText style={styles.nearbyMeta}>
            {city?.name ?? 'Türkiye'} • {value.route.stops.length} durak
          </ThemedText>
          <ThemedText style={styles.nearbyDistance}>
            {value.distanceKm?.toFixed(1)} km uzağında
          </ThemedText>
          <View style={styles.nearbyFooter}>
            <View style={styles.nearbyTagRow}>
              {value.route.tags.slice(0, 2).map((tag) => (
                <Tag key={tag} label={tag} colorScheme={colorScheme} compact />
              ))}
            </View>
            <Pressable onPress={onToggleFavorite} style={styles.nearbyFavoriteButton}>
              <ThemedText style={styles.nearbyFavoriteLabel}>{isFavorite ? '♥' : '♡'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function CityCard({
  cityId,
  colorScheme,
  resolveCity,
  onPress,
}: {
  cityId: string;
  colorScheme: 'light' | 'dark';
  resolveCity: (id: string) => City | undefined;
  onPress: () => void;
}) {
  const city = resolveCity(cityId);
  if (!city) return null;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView
        style={[
          styles.cityCard,
          {
            borderColor: Colors[colorScheme].tabIconDefault,
          },
        ]}>
        <Image source={{ uri: city.heroImage }} style={styles.cityImage} />
        <View style={styles.cityContent}>
          <ThemedText type="subtitle">{city.name}</ThemedText>
          <ThemedText style={styles.cityDescription}>{city.description}</ThemedText>
          <View style={styles.tagRow}>
            {city.highlightTags.map((tag) => (
              <Tag key={tag} label={tag} colorScheme={colorScheme} compact />
            ))}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
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
          backgroundColor: `${Colors[colorScheme].tint}20`,
          borderColor: Colors[colorScheme].tint,
          paddingHorizontal: compact ? 10 : 12,
          paddingVertical: compact ? 6 : 8,
        },
      ]}>
      <ThemedText style={styles.tagText} lightColor={Colors.light.tint} darkColor={Colors.dark.tint}>
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
  heroSubtitle: {
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  ctaButton: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ctaLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryLabel: {
    fontWeight: '600',
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
    color: '#8C6F60',
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
  routeFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  routeFavoriteLabel: {
    fontSize: 20,
    color: '#C65127',
  },
  routeContent: {
    padding: 16,
    gap: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 22,
  },
  routeRating: {
    fontWeight: '600',
  },
  routeDescription: {
    lineHeight: 22,
  },
  routeMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  },
  metaPill: {
    borderRadius: 999,
    backgroundColor: '#FDE6DA',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1C1A2',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  routeCompactImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  routeCompactContent: {
    flex: 1,
    gap: 4,
  },
  routeCompactTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeCompactMeta: {
    fontSize: 14,
    color: '#8C6F60',
  },
  compactTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  compactFavoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE2D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactFavoriteLabel: {
    fontSize: 18,
    color: '#C65127',
  },
  nearbyCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5CBB0',
    backgroundColor: '#FFF7ED',
    padding: 12,
    alignItems: 'center',
  },
  nearbyImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  nearbyContent: {
    flex: 1,
    gap: 6,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  nearbyMeta: {
    color: '#8C6F60',
  },
  nearbyDistance: {
    fontWeight: '600',
    color: '#C65127',
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  nearbyTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  nearbyFavoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE2D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyFavoriteLabel: {
    fontSize: 18,
    color: '#C65127',
  },
  permissionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5CBB0',
    backgroundColor: '#FFF2E6',
    padding: 16,
    gap: 8,
  },
  permissionCopy: {
    color: '#8C6F60',
    lineHeight: 18,
  },
  permissionButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  permissionButtonLabel: {
    fontWeight: '600',
  },
});

type RouteWithDistance = {
  route: Route;
  distanceKm: number | null;
};

function calculateNearestDistance(
  route: Route,
  userLocation: Coordinates,
  getPlaceById: (id: string) => ReturnType<typeof useGurumeData>['data']['places'][number] | undefined,
): number | null {
  const distances = route.stops
    .map((stop) => findStopCoordinate(stop, getPlaceById))
    .filter(Boolean)
    .map((coord) => haversine(userLocation, coord as Coordinates));

  if (!distances.length) return null;
  return Math.min(...distances);
}

function findStopCoordinate(
  stop: RouteStop,
  getPlaceById: (id: string) => ReturnType<typeof useGurumeData>['data']['places'][number] | undefined,
): Coordinates | null {
  if (stop.coordinates) {
    return stop.coordinates;
  }
  if (stop.placeId) {
    const place = getPlaceById(stop.placeId);
    if (place) {
      return place.coordinates;
    }
  }
  return null;
}

function haversine(origin: Coordinates, target: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(target.latitude - origin.latitude);
  const dLon = toRad(target.longitude - origin.longitude);
  const lat1 = toRad(origin.latitude);
  const lat2 = toRad(target.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
