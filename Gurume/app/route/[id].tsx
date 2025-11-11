/**
 * ROTA DETAY EKRANI - Google Maps Entegreli
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
// MapView removed - using Google Maps links instead

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockRoutes } from '@/data/mock-routes';
import type { Route } from '@/types';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRouteDetails();
    }
  }, [id]);

  const loadRouteDetails = async () => {
    if (!id) return;

    try {
      const routeData = mockRoutes.find(r => r.id === id);
      setRoute(routeData || null);
    } catch (error) {
      console.error('loadRouteDetails error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = (latitude: number, longitude: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'Harita açılamadı.');
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </ThemedView>
    );
  }

  if (!route) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="title">Rota bulunamadı</ThemedText>
        <Pressable
          style={[styles.backButton, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText} lightColor="#FFFFFF">
            Geri Dön
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // İlk durağın koordinatlarını harita merkezi olarak kullan
  const firstStop = route.stops?.[0];
  const initialRegion = firstStop
    ? {
        latitude: firstStop.latitude || 41.0082,
        longitude: firstStop.longitude || 28.9784,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cover Image */}
      <Image source={{ uri: route.coverImage }} style={styles.coverImage} />

      {/* Route Info */}
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">{route.title}</ThemedText>
          <View style={styles.ratingRow}>
            <ThemedText style={styles.rating}>⭐ {route.averageRating.toFixed(1)}</ThemedText>
            <ThemedText style={styles.ratingCount}>({route.ratingCount} değerlendirme)</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.description}>{route.description}</ThemedText>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <MetaBadge icon="⏱️" text={`${route.durationMinutes} dk`} colorScheme={colorScheme} />
          <MetaBadge icon="📍" text={`${route.stops?.length || 0} durak`} colorScheme={colorScheme} />
          {route.distanceKm && (
            <MetaBadge icon="🚶" text={`${route.distanceKm} km`} colorScheme={colorScheme} />
          )}
        </View>

        {/* Tags */}
        {route.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {route.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Author */}
        <View style={styles.authorSection}>
          <View style={styles.authorInfo}>
            {route.author.avatarUrl ? (
              <Image source={{ uri: route.author.avatarUrl }} style={styles.authorAvatar} />
            ) : (
              <View
                style={[styles.authorAvatarPlaceholder, { backgroundColor: Colors[colorScheme].border }]}>
                <ThemedText style={styles.authorAvatarText}>
                  {route.author.username[0].toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={styles.authorDetails}>
              <ThemedText style={styles.authorName}>@{route.author.username}</ThemedText>
              <ThemedText style={styles.authorMeta}>
                {route.author.totalRoutes} rota • {(route.author.averageRouteRating || 0).toFixed(1)}⭐
              </ThemedText>
            </View>
          </View>
          {route.isVerified && (
            <View style={styles.verifiedBadge}>
              <ThemedText style={styles.verifiedText}>✓ Doğrulanmış</ThemedText>
            </View>
          )}
        </View>

        {/* Map Section - Google Maps Link */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Harita
        </ThemedText>
        <Pressable
          style={[styles.mapsButton, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(route.title)}`;
            Linking.openURL(url);
          }}>
          <ThemedText style={styles.mapsButtonText} lightColor="#FFFFFF" darkColor="#1D1411">
            🗺️ Google Maps'te Aç
          </ThemedText>
        </Pressable>

        {/* Stops Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Duraklar ({route.stops?.length || 0})
        </ThemedText>

        <View style={styles.stopsList}>
          {route.stops?.map((stop, index) => (
            <View
              key={index}
              style={[styles.stopCard, { borderColor: Colors[colorScheme].border }]}>
              <View style={styles.stopNumberBadge}>
                <ThemedText style={styles.stopNumber}>{index + 1}</ThemedText>
              </View>

              <View style={styles.stopContent}>
                <ThemedText style={styles.stopHighlight}>{stop.highlight}</ThemedText>

                {stop.tastingNotes && stop.tastingNotes.length > 0 && (
                  <View style={styles.tastingNotes}>
                    {stop.tastingNotes.map((note, i) => (
                      <ThemedText key={i} style={styles.tastingNote}>
                        • {note}
                      </ThemedText>
                    ))}
                  </View>
                )}

                {stop.notes && <ThemedText style={styles.stopNotes}>{stop.notes}</ThemedText>}

                <View style={styles.stopMeta}>
                  {stop.dwellMinutes && (
                    <ThemedText style={styles.stopMetaText}>⏱️ {stop.dwellMinutes} dk</ThemedText>
                  )}
                  {stop.arrivalTime && (
                    <ThemedText style={styles.stopMetaText}>🕐 {stop.arrivalTime}</ThemedText>
                  )}
                </View>

                {/* Google Maps Button */}
                <Pressable
                  style={[styles.mapsButton, { backgroundColor: Colors[colorScheme].primary }]}
                  onPress={() =>
                    openInGoogleMaps(
                      stop.latitude || 41.0082,
                      stop.longitude || 28.9784,
                      stop.highlight
                    )
                  }>
                  <ThemedText style={styles.mapsButtonText} lightColor="#FFFFFF">
                    📍 Google Maps&apos;te Aç
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme].secondary }]}
            onPress={() => {
              if (!user) {
                Alert.alert('Giriş Gerekli', 'Bu özellik için giriş yapmalısınız.');
                return;
              }
              Alert.alert('Başarılı', 'Rota kaydedildi! (Test modu)');
            }}>
            <ThemedText style={styles.actionButtonText} lightColor="#FFFFFF">
              💾 Kaydet
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme].accent }]}
            onPress={() => {
              Alert.alert('Paylaş', 'Paylaşım özelliği yakında!');
            }}>
            <ThemedText style={styles.actionButtonText}>📤 Paylaş</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function MetaBadge({
  icon,
  text,
  colorScheme,
}: {
  icon: string;
  text: string;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <View style={[styles.metaBadge, { backgroundColor: Colors[colorScheme].badgeYellow }]}>
      <ThemedText style={styles.metaBadgeText}>
        {icon} {text}
      </ThemedText>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: 14,
  },
  description: {
    lineHeight: 24,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  metaBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  authorDetails: {
    gap: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: 13,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 22,
    marginTop: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  stopsList: {
    gap: 16,
  },
  stopCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  stopNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  stopContent: {
    gap: 10,
  },
  stopHighlight: {
    fontSize: 18,
    fontWeight: '700',
  },
  tastingNotes: {
    gap: 4,
  },
  tastingNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  stopNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  stopMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  stopMetaText: {
    fontSize: 13,
  },
  mapsButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
