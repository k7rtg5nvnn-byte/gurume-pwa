import React from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGurumeData } from '@/hooks/use-gurume-data';

export default function FavoritesScreen() {
  const { profile, isSupabaseReady } = useAuth();
  const { data, favoriteRouteIds, toggleFavorite, refreshData, isRefreshing } = useGurumeData();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const favorites = data.routes.filter((route) => favoriteRouteIds.includes(route.id));

  if (!profile && isSupabaseReady) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Favoriler için giriş yap</ThemedText>
        <ThemedText style={styles.subtitle}>
          Favori listeni kaydedebilmek için hesap oluşturman ya da giriş yapman gerekiyor.
        </ThemedText>
        <Pressable onPress={() => router.push('/sign-in')} style={[styles.ctaButton, { backgroundColor: Colors[colorScheme].tint }]}>
          <ThemedText style={styles.ctaLabel} lightColor="#FFFFFF" darkColor="#1D1411">
            Giriş Yap
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={favorites.length ? styles.listContent : styles.emptyContainer}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshData} />}
      ListEmptyComponent={
        <ThemedView style={styles.centered}>
          <ThemedText type="title">Henüz favorin yok</ThemedText>
          <ThemedText style={styles.subtitle}>
            Rotaları incelerken kalp ikonuna dokunarak favori listene ekleyebilirsin.
          </ThemedText>
          <Pressable
            onPress={() => router.push('/explore')}
            style={[styles.ctaButton, { backgroundColor: Colors[colorScheme].tint }]}>
            <ThemedText style={styles.ctaLabel} lightColor="#FFFFFF" darkColor="#1D1411">
              Keşfe Çık
            </ThemedText>
          </Pressable>
        </ThemedView>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/route/${item.id}`)} style={[styles.card, { borderColor: Colors[colorScheme].tabIconDefault }]}>
          {item.coverImage ? <Image source={{ uri: item.coverImage }} style={styles.cardImage} /> : null}
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              <Pressable
                onPress={() => toggleFavorite(item.id)}
                accessibilityRole="button"
                hitSlop={12}
                style={styles.favoriteButton}>
                <ThemedText style={styles.favoriteEmoji}>♥</ThemedText>
              </Pressable>
            </View>
            <ThemedText style={styles.cardMeta}>
              {item.cityId && (data.cities.find((city) => city.id === item.cityId)?.name ?? 'Türkiye')} •{' '}
              {item.stops.length} durak • ⭐ {item.averageRating?.toFixed(1) ?? '5.0'}
            </ThemedText>
            <ThemedText style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
            {item.tags?.length ? (
              <View style={styles.tagRow}>
                {item.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={[styles.tag, { borderColor: Colors[colorScheme].tint }]}>
                    <ThemedText
                      style={styles.tagText}
                      lightColor={Colors.light.tint}
                      darkColor={Colors.dark.tint}>
                      #{tag}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  subtitle: {
    textAlign: 'center',
    color: '#8C6F60',
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  ctaLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFF7EE',
  },
  cardImage: {
    height: 160,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD7BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteEmoji: {
    fontSize: 20,
    color: '#CC4529',
  },
  cardMeta: {
    color: '#8C6F60',
    fontSize: 13,
  },
  cardDescription: {
    lineHeight: 20,
    color: '#5C463D',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFE9DB',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
