import React, { useMemo } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGurumeData } from '@/hooks/use-gurume-data';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { getRouteById, getCityById, getPlaceById, favoriteRouteIds, toggleFavorite } = useGurumeData();

  const route = id ? getRouteById(id) : undefined;

  const city = useMemo(() => (route ? getCityById(route.cityId) : undefined), [route, getCityById]);
  const isFavorite = route ? favoriteRouteIds.includes(route.id) : false;

  if (!route) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Rota bulunamadı</ThemedText>
        <ThemedText style={styles.helperText}>Listeye geri dönüp tekrar dener misin?</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backLink} accessibilityRole="button">
        <ThemedText style={styles.backLinkText}>← Rotalara dön</ThemedText>
      </Pressable>

        <ThemedView style={styles.coverCard}>
          <Image source={{ uri: route.coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <ThemedText type="title" style={styles.coverTitle}>
              {route.title}
            </ThemedText>
            <Pressable
              onPress={() => toggleFavorite(route.id)}
              style={styles.coverFavoriteButton}>
              <ThemedText style={styles.coverFavoriteLabel}>{isFavorite ? '♥' : '♡'}</ThemedText>
            </Pressable>
            <ThemedText style={styles.coverMeta}>
              {city?.name ?? 'Bilinmeyen şehir'} • {route.stops.length} durak •{' '}
              {route.durationMinutes ?? '--'} dk • ⭐ {route.averageRating.toFixed(1)}
            </ThemedText>
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: Colors[colorScheme].tint }]}>
              <ThemedText style={styles.authorInitials} lightColor="#FFFFFF" darkColor="#1D1411">
                {route.author.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.authorInfo}>
              <ThemedText style={styles.authorName}>{route.author.name}</ThemedText>
              <ThemedText style={styles.authorTitle}>{route.author.title}</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Rota Özeti</ThemedText>
        <ThemedText style={styles.sectionBody}>{route.description}</ThemedText>
          <View style={styles.metaRow}>
            <MetaTile label="Süre" value={route.durationMinutes ? `${route.durationMinutes} dk` : 'Belirsiz'} />
            <MetaTile
              label="Mesafe"
              value={typeof route.distanceKm === 'number' ? `${route.distanceKm.toFixed(1)} km` : 'Belirsiz'}
            />
            <MetaTile label="Puan" value={`⭐ ${route.averageRating.toFixed(1)}`} />
        </View>
        <View style={styles.tagRow}>
          {route.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </View>
      </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Duraklar</ThemedText>
          <View style={styles.stopList}>
            {route.stops.map((stop) => {
              const place = stop.placeId ? getPlaceById(stop.placeId) : undefined;
              if (!place && !stop.placeName) {
                return null;
              }

              const displayName = place?.name ?? stop.placeName ?? 'Lezzet durağı';
              const displaySummary = place?.summary ?? stop.placeSummary ?? '';
              const tastingNotes = stop.tastingNotes.length ? stop.tastingNotes : place?.specialties ?? [];
              const image = stop.imageUrl ?? place?.heroImage;

              return (
                <ThemedView key={stop.placeId ?? stop.id ?? `stop-${stop.order}`} style={styles.stopCard}>
                  {image ? <Image source={{ uri: image }} style={styles.stopImage} /> : null}
                  <View style={styles.stopBody}>
                    <View style={styles.stopHeader}>
                      <View style={styles.stopOrder}>
                        <ThemedText style={styles.stopOrderText}>{stop.order}</ThemedText>
                      </View>
                      <View style={styles.stopTitleGroup}>
                        <ThemedText type="subtitle" style={styles.stopTitle}>
                          {displayName}
                        </ThemedText>
                        <ThemedText style={styles.stopDistrict}>{displaySummary}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.stopHighlight}>{stop.highlight}</ThemedText>
                    <View style={styles.tastingList}>
                      {tastingNotes.map((note) => (
                        <View key={note} style={styles.tastingItem}>
                          <ThemedText style={styles.tastingText}>{note}</ThemedText>
                        </View>
                      ))}
                    </View>
                    {place ? (
                      <View style={styles.scoreRow}>
                        <ScoreChip label="Hız" value={place.speedScore} />
                        <ScoreChip label="Temizlik" value={place.cleanlinessScore} />
                        <ScoreChip label="Fiyat" value={place.valueScore} />
                      </View>
                    ) : stop.priceLevel ? (
                      <View style={styles.scoreRow}>
                        <PriceChip priceLevel={stop.priceLevel} />
                      </View>
                    ) : null}
                  </View>
                </ThemedView>
              );
            })}
          </View>
        </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Planlama Notları</ThemedText>
        <View style={styles.noteCard}>
          <ThemedText style={styles.noteTitle}>Zamanlama</ThemedText>
          <ThemedText style={styles.noteBody}>
            Duraklar arası ortalama {Math.round(route.durationMinutes / Math.max(route.stops.length, 1))} dakikada
            tamamlanıyor. Akşam saatlerinde yoğunluk için 15 dk ekstra pay bırak.
          </ThemedText>
        </View>
        <View style={styles.noteCard}>
          <ThemedText style={styles.noteTitle}>Ulaşım</ThemedText>
          <ThemedText style={styles.noteBody}>
            Yürüme + toplu taşıma kombinasyonu önerilir. Kadıköy geçişinde vapur hatlarını kullan.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaTile}>
      <ThemedText style={styles.metaTileLabel}>{label}</ThemedText>
      <ThemedText style={styles.metaTileValue}>{value}</ThemedText>
    </View>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <View style={styles.tagPill}>
      <ThemedText style={styles.tagPillText}>#{label}</ThemedText>
    </View>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreChip}>
      <ThemedText style={styles.scoreChipLabel}>{label}</ThemedText>
      <ThemedText style={styles.scoreChipValue}>{value.toFixed(1)}</ThemedText>
    </View>
  );
}

function PriceChip({ priceLevel }: { priceLevel: '₺' | '₺₺' | '₺₺₺' }) {
  return (
    <View style={styles.scoreChip}>
      <ThemedText style={styles.scoreChipLabel}>Fiyat</ThemedText>
      <ThemedText style={styles.scoreChipValue}>{priceLevel}</ThemedText>
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
    padding: 24,
    gap: 16,
  },
  helperText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FFE0C9',
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
  coverCard: {
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    height: 220,
    width: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  coverContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    gap: 12,
  },
  coverFavoriteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFavoriteLabel: {
    fontSize: 22,
    color: '#F2A365',
  },
  coverTitle: {
    color: '#FFFFFF',
  },
  coverMeta: {
    color: '#F5E2D5',
  },
  authorRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitials: {
    fontWeight: '700',
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  authorTitle: {
    color: '#FCE8DD',
    fontSize: 13,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  sectionBody: {
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaTile: {
    flexBasis: '32%',
    minWidth: 110,
    borderRadius: 16,
    backgroundColor: '#FFE9DB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  metaTileLabel: {
    fontSize: 12,
    color: '#8C6F60',
    textTransform: 'uppercase',
  },
  metaTileValue: {
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    backgroundColor: '#FFDCC5',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagPillText: {
    fontWeight: '600',
    fontSize: 13,
  },
  stopList: {
    gap: 16,
  },
  stopCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F5CBB0',
  },
  stopImage: {
    height: 140,
    width: '100%',
  },
  stopBody: {
    padding: 16,
    gap: 12,
  },
  stopHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stopOrder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopOrderText: {
    fontWeight: '700',
  },
  stopTitleGroup: {
    flex: 1,
    gap: 4,
  },
  stopTitle: {
    fontSize: 20,
  },
  stopDistrict: {
    color: '#8C6F60',
  },
  stopHighlight: {
    lineHeight: 20,
  },
  tastingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tastingItem: {
    backgroundColor: '#FFF2E8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tastingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE9DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreChipLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  scoreChipValue: {
    fontWeight: '600',
  },
  noteCard: {
    borderRadius: 18,
    backgroundColor: '#FFF2E8',
    padding: 16,
    gap: 6,
  },
  noteTitle: {
    fontWeight: '600',
  },
  noteBody: {
    lineHeight: 20,
  },
});
