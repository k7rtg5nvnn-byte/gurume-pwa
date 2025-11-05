import React from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { mockData, featuredRouteIds, highlightedCityIds } from '@/data/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Route } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const featuredRoutes = mockData.routes.filter((route) => featuredRouteIds.includes(route.id));
  const highlightedCities = mockData.cities.filter((city) => highlightedCityIds.includes(city.id));

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
              <ThemedText style={styles.secondaryLabel}>
                Şehirleri incele
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

      <Section
        title="Öne Çıkan Rotalar"
        subtitle="Topluluğun favori lezzet kaçamakları"
        data={featuredRoutes}
        renderItem={(route) => (
          <RouteCard key={route.id} route={route} colorScheme={colorScheme} />
        )}
      />

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
        renderItem={({ item }) => <CityCard cityId={item.id} colorScheme={colorScheme} />}
      />

      <Section
        title="Toplulukta Popüler"
        subtitle="Son haftada en çok puanlanan rotalar"
        data={mockData.routes.slice(0, 3)}
        renderItem={(route) => (
          <RouteCompact key={route.id} route={route} colorScheme={colorScheme} />
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

function RouteCard({ route, colorScheme }: { route: Route; colorScheme: 'light' | 'dark' }) {
  const city = mockData.cities.find((c) => c.id === route.cityId);
  const stopCount = route.stops.length;

  return (
    <ThemedView
      style={[
        styles.routeCard,
        {
          borderColor: Colors[colorScheme].tabIconDefault,
        },
      ]}>
      <Image source={{ uri: route.coverImage }} style={styles.routeImage} />
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
          <MetaPill label={`${Math.round(route.distanceKm)} km`} />
        </View>
        <View style={styles.tagRow}>
          {route.tags.map((tag) => (
            <Tag key={tag} label={tag} colorScheme={colorScheme} />
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

function RouteCompact({ route, colorScheme }: { route: Route; colorScheme: 'light' | 'dark' }) {
  const city = mockData.cities.find((c) => c.id === route.cityId);

  return (
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
    </ThemedView>
  );
}

function CityCard({ cityId, colorScheme }: { cityId: string; colorScheme: 'light' | 'dark' }) {
  const city = mockData.cities.find((item) => item.id === cityId);
  if (!city) return null;

  return (
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
});
