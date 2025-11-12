/**
 * ANA EKRAN - MODERN TASARIM
 * 
 * ✨ Özellikler:
 * - Trending rotalar
 * - Modern gradient kartlar
 * - Smooth animations
 * - Pull to refresh
 * - Empty states
 * - Quick stats
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { routesService } from '@/services/routes.service';
import type { Route } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trendingRoutes, setTrendingRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [stats, setStats] = useState({ totalRoutes: 0, totalCities: 0, avgRating: 0 });

  useEffect(() => {
    loadData();
  }, [selectedCityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Ana rotaları yükle
      const allRoutes = await routesService.getAllRoutes(
        selectedCityId ? { cityIds: [selectedCityId] } : undefined
      );
      
      // Puana göre sırala
      const sorted = [...allRoutes].sort((a, b) => b.averageRating - a.averageRating);
      setRoutes(sorted);
      
      // Trending rotalar (en yüksek puanlı + en çok görüntülenen)
      const trending = [...allRoutes]
        .sort((a, b) => (b.averageRating * b.viewCount) - (a.averageRating * a.viewCount))
        .slice(0, 5);
      setTrendingRoutes(trending);
      
      // İstatistikler
      const uniqueCities = new Set(allRoutes.map(r => r.cityId));
      const avgRating = allRoutes.reduce((sum, r) => sum + r.averageRating, 0) / (allRoutes.length || 1);
      setStats({
        totalRoutes: allRoutes.length,
        totalCities: uniqueCities.size,
        avgRating: avgRating,
      });
      
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredCities = turkeyCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCity = turkeyCities.find(c => c.id === selectedCityId);

  // ========== RENDER FUNCTIONS ==========

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
        <ThemedText style={styles.statValue}>{stats.totalRoutes}</ThemedText>
        <ThemedText style={styles.statLabel}>Rota</ThemedText>
      </View>
      <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
        <ThemedText style={styles.statValue}>{stats.totalCities}</ThemedText>
        <ThemedText style={styles.statLabel}>Şehir</ThemedText>
      </View>
      <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
        <ThemedText style={styles.statValue}>{stats.avgRating.toFixed(1)}⭐</ThemedText>
        <ThemedText style={styles.statLabel}>Ortalama</ThemedText>
      </View>
    </View>
  );

  const renderTrendingCard = ({ item }: { item: Route }) => (
    <Pressable
      style={styles.trendingCard}
      onPress={() => router.push(`/route/${item.id}`)}>
      <Image
        source={{ uri: item.coverImage }}
        style={styles.trendingImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.trendingGradient}>
        <ThemedText style={styles.trendingTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          {item.title}
        </ThemedText>
        <View style={styles.trendingMeta}>
          <ThemedText style={styles.trendingRating} lightColor="#FFFFFF" darkColor="#FFFFFF">
            ⭐ {item.averageRating.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.trendingViews} lightColor="#FFFFFF" darkColor="#FFFFFF">
            👁️ {item.viewCount}
          </ThemedText>
        </View>
      </LinearGradient>
    </Pressable>
  );

  const renderRouteCard = ({ item }: { item: Route }) => (
    <Pressable
      style={[styles.routeCard, { 
        backgroundColor: Colors[colorScheme].cardBackground,
        borderColor: Colors[colorScheme].border 
      }]}
      onPress={() => router.push(`/route/${item.id}`)}>
      <Image
        source={{ uri: item.coverImage }}
        style={styles.routeImage}
        contentFit="cover"
      />
      <View style={styles.routeContent}>
        <View style={styles.routeHeader}>
          <ThemedText style={styles.routeTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={[styles.ratingBadge, { backgroundColor: Colors[colorScheme].primary }]}>
            <ThemedText style={styles.ratingText} lightColor="#FFFFFF" darkColor="#1D1411">
              ⭐ {item.averageRating.toFixed(1)}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.routeCity}>
          📍 {turkeyCities.find(c => c.id === item.cityId)?.name || 'Türkiye'}
        </ThemedText>
        
        <ThemedText style={styles.routeDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        
        <View style={styles.routeMeta}>
          <View style={styles.metaItem}>
            <ThemedText style={styles.metaText}>⏱️ {item.durationMinutes} dk</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <ThemedText style={styles.metaText}>🍽️ {item.stops?.length || 0} mekan</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <ThemedText style={styles.metaText}>💬 {item.reviewCount}</ThemedText>
          </View>
        </View>

        <View style={styles.authorSection}>
          <Image
            source={{ uri: item.author.avatarUrl || 'https://ui-avatars.com/api/?name=' + item.author.username }}
            style={styles.authorAvatar}
            contentFit="cover"
          />
          <View style={styles.authorInfo}>
            <ThemedText style={styles.authorName}>
              {item.author.fullName || item.author.username}
              {item.author.isVerified && ' ✓'}
            </ThemedText>
            <ThemedText style={styles.authorStats}>
              {item.author.totalRoutes} rota
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyEmoji}>🍽️</ThemedText>
      <ThemedText style={styles.emptyTitle}>Henüz Rota Yok</ThemedText>
      <ThemedText style={styles.emptyText}>
        {selectedCity 
          ? `${selectedCity.name} için henüz rota eklenmemiş.`
          : 'İlk rotayı sen oluştur!'}
      </ThemedText>
      <Pressable
        style={[styles.emptyButton, { backgroundColor: Colors[colorScheme].primary }]}
        onPress={() => router.push('/(tabs)/create')}>
        <ThemedText style={styles.emptyButtonText} lightColor="#FFFFFF" darkColor="#1D1411">
          ➕ Rota Oluştur
        </ThemedText>
      </Pressable>
    </View>
  );

  const renderSkeletonCard = () => (
    <View style={[styles.routeCard, { 
      backgroundColor: Colors[colorScheme].cardBackground,
      borderColor: Colors[colorScheme].border 
    }]}>
      <View style={[styles.routeImage, { backgroundColor: Colors[colorScheme].border }]} />
      <View style={styles.routeContent}>
        <View style={[styles.skeleton, styles.skeletonTitle, { backgroundColor: Colors[colorScheme].border }]} />
        <View style={[styles.skeleton, styles.skeletonText, { backgroundColor: Colors[colorScheme].border }]} />
        <View style={[styles.skeleton, styles.skeletonText, { backgroundColor: Colors[colorScheme].border, width: '60%' }]} />
      </View>
    </View>
  );

  // ========== MAIN RENDER ==========

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
          style={styles.header}>
          <ThemedText style={styles.headerTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Gurume 🍽️
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Türkiye'nin lezzet haritası
          </ThemedText>
        </LinearGradient>
        <ScrollView style={styles.content}>
          {renderSkeletonCard()}
          {renderSkeletonCard()}
          {renderSkeletonCard()}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
        style={styles.header}>
        <ThemedText style={styles.headerTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Gurume 🍽️
        </ThemedText>
        <ThemedText style={styles.headerSubtitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Türkiye'nin lezzet haritası
        </ThemedText>
      </LinearGradient>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteCard}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Quick Stats */}
            {renderQuickStats()}

            {/* City Selector */}
            <View style={styles.citySection}>
              <Pressable
                style={[styles.citySelector, { 
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].cardBackground 
                }]}
                onPress={() => setShowCityPicker(!showCityPicker)}>
                <ThemedText style={styles.citySelectorText}>
                  📍 {selectedCity ? selectedCity.name : 'Tüm Şehirler'}
                </ThemedText>
                <ThemedText style={styles.citySelectorIcon}>
                  {showCityPicker ? '▲' : '▼'}
                </ThemedText>
              </Pressable>

              {showCityPicker && (
                <View style={[styles.cityPickerDropdown, { 
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].cardBackground 
                }]}>
                  <TextInput
                    style={[styles.citySearchInput, { 
                      borderColor: Colors[colorScheme].border,
                      color: Colors[colorScheme].text 
                    }]}
                    placeholder="Şehir ara..."
                    placeholderTextColor={Colors[colorScheme].textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  
                  <Pressable
                    style={styles.cityPickerItem}
                    onPress={() => {
                      setSelectedCityId('');
                      setShowCityPicker(false);
                    }}>
                    <ThemedText style={styles.cityPickerItemText}>
                      🌍 Tüm Şehirler
                    </ThemedText>
                  </Pressable>

                  <ScrollView style={styles.cityPickerScroll}>
                    {filteredCities.map((city) => (
                      <Pressable
                        key={city.id}
                        style={[
                          styles.cityPickerItem,
                          selectedCityId === city.id && { backgroundColor: Colors[colorScheme].primary + '20' }
                        ]}
                        onPress={() => {
                          setSelectedCityId(city.id);
                          setShowCityPicker(false);
                          setSearchQuery('');
                        }}>
                        <ThemedText style={styles.cityPickerItemText}>
                          {selectedCityId === city.id && '✓ '}
                          {city.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Trending Section */}
            {trendingRoutes.length > 0 && (
              <View style={styles.trendingSection}>
                <ThemedText style={styles.sectionTitle}>🔥 Trend Rotalar</ThemedText>
                <FlatList
                  data={trendingRoutes}
                  keyExtractor={(item) => item.id}
                  renderItem={renderTrendingCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingList}
                />
              </View>
            )}

            {/* Main List Title */}
            <ThemedText style={styles.sectionTitle}>
              {selectedCity ? `${selectedCity.name} Rotaları` : '📍 Tüm Rotalar'}
            </ThemedText>
          </>
        }
        ListEmptyComponent={renderEmptyState}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  
  // Quick Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  
  // City Section
  citySection: {
    marginBottom: 20,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  citySelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  citySelectorIcon: {
    fontSize: 16,
  },
  cityPickerDropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 400,
  },
  citySearchInput: {
    padding: 12,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  cityPickerScroll: {
    maxHeight: 300,
  },
  cityPickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cityPickerItemText: {
    fontSize: 15,
  },
  
  // Trending Section
  trendingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  trendingList: {
    paddingRight: 20,
  },
  trendingCard: {
    width: CARD_WIDTH * 0.8,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trendingMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendingViews: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Route Cards
  routeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  routeImage: {
    width: '100%',
    height: 200,
  },
  routeContent: {
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeCity: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  authorStats: {
    fontSize: 12,
    opacity: 0.6,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Skeleton Loading
  skeleton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTitle: {
    height: 24,
    width: '80%',
  },
  skeletonText: {
    height: 16,
    width: '100%',
  },
});
