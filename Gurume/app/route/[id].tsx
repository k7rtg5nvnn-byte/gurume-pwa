/**
 * ROTA DETAY EKRANI
 * 
 * - Rota bilgileri
 * - Duraklar listesi
 * - Harita (opsiyonel)
 * - Rating & Reviews
 * - Rating ekleme
 * - Kaydetme
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routesService } from '@/services/routes.service';
import { ratingsService } from '@/services/ratings.service';
import type { Route, RouteRating } from '@/types';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [route, setRoute] = useState<Route | null>(null);
  const [ratings, setRatings] = useState<RouteRating[]>([]);
  const [userRating, setUserRating] = useState<RouteRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Rating form state
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadRouteDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRouteDetails = async () => {
    if (!id) return;

    try {
      const routeData = await routesService.getRouteById(id);
      setRoute(routeData);

      const ratingsData = await ratingsService.getRatingsByRoute(id);
      setRatings(ratingsData);

      if (user) {
        const userRatingData = await ratingsService.getUserRatingForRoute(user.id, id);
        setUserRating(userRatingData);
      }
    } catch (error) {
      console.error('loadRouteDetails error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Değerlendirme yapmak için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    if (!id) return;

    if (!ratingComment.trim()) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın.');
      return;
    }

    setSubmitting(true);
    const result = await ratingsService.createRating(
      {
        routeId: id,
        score: ratingScore,
        comment: ratingComment,
        visitedAt: new Date().toISOString().split('T')[0],
      },
      user.id
    );
    setSubmitting(false);

    if (result.success) {
      Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi. Teşekkürler!');
      setShowRatingForm(false);
      setRatingComment('');
      loadRouteDetails();
    } else {
      Alert.alert('Hata', result.error?.message || 'Değerlendirme kaydedilemedi.');
    }
  };

  const handleSaveRoute = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!id) return;

    const result = await routesService.saveRoute(user.id, id);
    if (result.success) {
      Alert.alert('Başarılı', 'Rota kaydedildi.');
    }
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
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Rota bulunamadı.</ThemedText>
        <Pressable
          style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => router.back()}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF">
            Geri Dön
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cover Image */}
      <Image source={{ uri: route.coverImage }} style={styles.coverImage} />

      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              {route.title}
            </ThemedText>
            <View style={styles.ratingRow}>
              <ThemedText style={styles.rating}>⭐ {route.averageRating.toFixed(1)}</ThemedText>
              <ThemedText style={styles.ratingCount}>({route.ratingCount} değerlendirme)</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MetaBadge
            icon="📍"
            label={`${route.stops?.length || 0} durak`}
            colorScheme={colorScheme}
          />
          <MetaBadge icon="⏱️" label={`${route.durationMinutes} dk`} colorScheme={colorScheme} />
          <MetaBadge
            icon="🚶"
            label={`${route.distanceKm.toFixed(1)} km`}
            colorScheme={colorScheme}
          />
        </View>

        <View style={styles.authorRow}>
          <ThemedText style={styles.authorLabel}>Oluşturan:</ThemedText>
          <ThemedText style={styles.authorName}>@{route.author.username}</ThemedText>
          {route.author.isVerified && <ThemedText>✓</ThemedText>}
        </View>

        <ThemedText style={styles.description}>{route.description}</ThemedText>

        <View style={styles.tagsRow}>
          {route.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                {
                  backgroundColor: Colors[colorScheme].badgeYellow,
                  borderColor: Colors[colorScheme].accent,
                },
              ]}>
              <ThemedText style={styles.tagText}>#{tag}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme].primary }]}
            onPress={() => setShowRatingForm(true)}>
            <ThemedText style={styles.actionButtonText} lightColor="#FFFFFF">
              Değerlendir
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: Colors[colorScheme].secondary },
            ]}
            onPress={handleSaveRoute}>
            <ThemedText style={styles.actionButtonText} lightColor="#FFFFFF">
              Kaydet
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* Stops */}
      {route.stops && route.stops.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Duraklar ({route.stops.length})
          </ThemedText>
          {route.stops.map((stop, index) => (
            <View
              key={stop.order}
              style={[styles.stopCard, { borderColor: Colors[colorScheme].border }]}>
              <View style={styles.stopNumber}>
                <ThemedText style={styles.stopNumberText}>{index + 1}</ThemedText>
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
                <ThemedText style={styles.stopMeta}>⏱️ {stop.dwellMinutes} dakika</ThemedText>
              </View>
            </View>
          ))}
        </ThemedView>
      )}

      {/* Rating Form */}
      {showRatingForm && !userRating && (
        <ThemedView style={[styles.ratingForm, { borderColor: Colors[colorScheme].border }]}>
          <ThemedText type="subtitle">Rotayı Değerlendir</ThemedText>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRatingScore(star)}>
                <ThemedText style={styles.star}>{star <= ratingScore ? '⭐' : '☆'}</ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[
              styles.ratingInput,
              {
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground,
                color: Colors[colorScheme].text,
              },
            ]}
            placeholder="Deneyiminizi paylaşın..."
            placeholderTextColor={Colors[colorScheme].textLight}
            value={ratingComment}
            onChangeText={setRatingComment}
            multiline
            numberOfLines={4}
          />

          <View style={styles.ratingActions}>
            <Pressable
              style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={handleSubmitRating}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF">
                  Gönder
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: Colors[colorScheme].border }]}
              onPress={() => setShowRatingForm(false)}>
              <ThemedText style={styles.buttonText}>İptal</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      {/* Ratings List */}
      {ratings.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Değerlendirmeler ({ratings.length})
          </ThemedText>
          {ratings.map((rating) => (
            <View
              key={rating.id}
              style={[styles.ratingCard, { borderColor: Colors[colorScheme].border }]}>
              <View style={styles.ratingHeader}>
                <View style={styles.ratingUser}>
                  <ThemedText style={styles.ratingUsername}>@{rating.user?.username}</ThemedText>
                  {rating.user?.isVerified && <ThemedText>✓</ThemedText>}
                </View>
                <ThemedText style={styles.ratingScore}>
                  {'⭐'.repeat(rating.score)}
                </ThemedText>
              </View>
              <ThemedText style={styles.ratingComment}>{rating.comment}</ThemedText>
              <ThemedText style={styles.ratingDate}>
                {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      )}
    </ScrollView>
  );
}

function MetaBadge({
  icon,
  label,
  colorScheme,
}: {
  icon: string;
  label: string;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <View style={[styles.metaBadge, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
      <ThemedText style={styles.metaBadgeText}>
        {icon} {label}
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
    gap: 16,
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  header: {
    padding: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 28,
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorLabel: {
    fontSize: 14,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    lineHeight: 24,
    fontSize: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  section: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
  },
  stopCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  stopContent: {
    flex: 1,
    gap: 8,
  },
  stopHighlight: {
    fontSize: 16,
    fontWeight: '600',
  },
  tastingNotes: {
    gap: 4,
  },
  tastingNote: {
    fontSize: 14,
  },
  stopMeta: {
    fontSize: 12,
  },
  ratingForm: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  star: {
    fontSize: 32,
  },
  ratingInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  ratingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  ratingCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingUsername: {
    fontWeight: '600',
  },
  ratingScore: {
    fontSize: 16,
  },
  ratingComment: {
    lineHeight: 22,
  },
  ratingDate: {
    fontSize: 12,
  },
});
