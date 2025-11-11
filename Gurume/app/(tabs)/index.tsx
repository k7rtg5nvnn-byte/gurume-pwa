/**
 * ANA EKRAN - YENİDEN TASARIM
 * 
 * Üstte: İl arama/seçimi
 * Altında: Seçilen ilin rotaları (puana göre sıralı)
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
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { mockRoutes } from '@/data/mock-routes';
import type { Route } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, [selectedCityId, selectedDistrictIds]);

  const loadRoutes = () => {
    setLoading(true);
    
    let filteredRoutes = [...mockRoutes];
    
    if (selectedCityId) {
      filteredRoutes = filteredRoutes.filter(r => r.cityId === selectedCityId);
    }
    
    if (selectedDistrictIds.length > 0) {
      filteredRoutes = filteredRoutes.filter(r => 
        r.districtIds.some(id => selectedDistrictIds.includes(id))
      );
    }
    
    // Puana göre sırala
    filteredRoutes.sort((a, b) => b.averageRating - a.averageRating);
    
    setRoutes(filteredRoutes);
    setLoading(false);
  };

  const filteredCities = turkeyCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCity = turkeyCities.find(c => c.id === selectedCityId);

  return (
    <ThemedView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
        style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Gurume
        </ThemedText>
        <ThemedText style={styles.headerSubtitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Türkiye'nin lezzet rotaları
        </ThemedText>
      </LinearGradient>

      {/* City Search/Picker */}
      <View style={styles.searchSection}>
        <ThemedText style={styles.searchLabel}>📍 Şehir Seçin</ThemedText>
        
        <Pressable
          style={[styles.cityPickerButton, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground 
          }]}
          onPress={() => setShowCityPicker(!showCityPicker)}>
          <ThemedText style={selectedCity ? styles.citySelectedText : styles.cityPlaceholderText}>
            {selectedCity ? selectedCity.name : 'Tüm Şehirler'}
          </ThemedText>
          <ThemedText style={styles.chevron}>{showCityPicker ? '▲' : '▼'}</ThemedText>
        </Pressable>

        {showCityPicker && (
          <View style={[styles.cityDropdown, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground 
          }]}>
            <TextInput
              style={[styles.searchInput, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text 
              }]}
              placeholder="Şehir ara..."
              placeholderTextColor={Colors[colorScheme].textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.cityList} nestedScrollEnabled>
              <Pressable
                style={[styles.cityItem, !selectedCityId && styles.cityItemActive]}
                onPress={() => {
                  setSelectedCityId('');
                  setSelectedDistrictIds([]);
                  setShowCityPicker(false);
                  setSearchQuery('');
                }}>
                <ThemedText style={styles.cityItemText}>🌍 Tüm Şehirler</ThemedText>
              </Pressable>
              
              {filteredCities.map((city) => (
                <Pressable
                  key={city.id}
                  style={[
                    styles.cityItem,
                    city.id === selectedCityId && styles.cityItemActive,
                    { borderBottomColor: Colors[colorScheme].border }
                  ]}
                  onPress={() => {
                    setSelectedCityId(city.id);
                    setSelectedDistrictIds([]);
                    setShowCityPicker(false);
                    setSearchQuery('');
                  }}>
                  <ThemedText style={styles.cityItemText}>{city.name}</ThemedText>
                  {city.id === selectedCityId && <ThemedText>✓</ThemedText>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* District Picker - Show only if city selected */}
        {selectedCity && (
          <View style={styles.field}>
            <ThemedText style={styles.searchLabel}>🏘️ İlçe Seçin (Opsiyonel)</ThemedText>
            <Pressable
              style={[styles.cityPickerButton, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground 
              }]}
              onPress={() => setShowDistrictPicker(!showDistrictPicker)}>
              <ThemedText style={selectedDistrictIds.length > 0 ? styles.citySelectedText : styles.cityPlaceholderText}>
                {selectedDistrictIds.length > 0 
                  ? `${selectedDistrictIds.length} ilçe seçildi` 
                  : 'Tüm İlçeler'}
              </ThemedText>
              <ThemedText style={styles.chevron}>{showDistrictPicker ? '▲' : '▼'}</ThemedText>
            </Pressable>

            {showDistrictPicker && (
              <View style={[styles.cityDropdown, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground 
              }]}>
                <ScrollView style={styles.cityList} nestedScrollEnabled>
                  <Pressable
                    style={[styles.cityItem, selectedDistrictIds.length === 0 && styles.cityItemActive]}
                    onPress={() => {
                      setSelectedDistrictIds([]);
                      setShowDistrictPicker(false);
                    }}>
                    <ThemedText style={styles.cityItemText}>🌍 Tüm İlçeler</ThemedText>
                  </Pressable>
                  
                  {selectedCity.districts.map((district) => {
                    const isSelected = selectedDistrictIds.includes(district.id);
                    return (
                      <Pressable
                        key={district.id}
                        style={[
                          styles.cityItem,
                          isSelected && styles.cityItemActive,
                          { borderBottomColor: Colors[colorScheme].border }
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedDistrictIds(selectedDistrictIds.filter(id => id !== district.id));
                          } else {
                            setSelectedDistrictIds([...selectedDistrictIds, district.id]);
                          }
                        }}>
                        <ThemedText style={styles.cityItemText}>{district.name}</ThemedText>
                        {isSelected && <ThemedText>✓</ThemedText>}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {selectedDistrictIds.length > 0 && (
              <View style={styles.selectedTags}>
                {selectedCity.districts.filter(d => selectedDistrictIds.includes(d.id)).map((district) => (
                  <View key={district.id} style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                    <ThemedText style={styles.tagText}>{district.name}</ThemedText>
                    <Pressable onPress={() => setSelectedDistrictIds(selectedDistrictIds.filter(id => id !== district.id))}>
                      <ThemedText style={styles.tagClose}> ✕</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Routes List */}
      <View style={styles.routesSection}>
        <View style={styles.routesHeader}>
          <ThemedText type="subtitle">
            {selectedCity ? `${selectedCity.name} Rotaları` : 'Tüm Rotalar'}
          </ThemedText>
          <ThemedText style={styles.routesCount}>
            {routes.length} rota
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {selectedCity 
                ? `${selectedCity.name} için henüz rota eklenmemiş.`
                : 'Henüz rota eklenmemiş.'}
            </ThemedText>
            <Pressable
              style={[styles.createButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={() => router.push('/(tabs)/create')}>
              <ThemedText style={styles.createButtonText} lightColor="#FFFFFF" darkColor="#1D1411">
                ➕ İlk Rotayı Sen Oluştur
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
            contentContainerStyle={styles.routesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ThemedView>
  );
}

// Route Card Component
function RouteCard({ 
  route, 
  colorScheme, 
  onPress 
}: { 
  route: Route; 
  colorScheme: 'light' | 'dark'; 
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.routeCard, { 
        backgroundColor: Colors[colorScheme].cardBackground,
        borderColor: Colors[colorScheme].border 
      }]}
      onPress={onPress}>
      <Image
        source={{ uri: route.coverImage }}
        style={styles.routeImage}
        contentFit="cover"
      />
      
      <View style={styles.routeContent}>
        <View style={styles.routeHeader}>
          <ThemedText style={styles.routeTitle} numberOfLines={2}>
            {route.title}
          </ThemedText>
          <View style={styles.ratingBadge}>
            <ThemedText style={styles.ratingText}>⭐ {route.averageRating.toFixed(1)}</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.routeDescription} numberOfLines={2}>
          {route.description}
        </ThemedText>
        
        <View style={styles.routeMeta}>
          <ThemedText style={styles.metaText}>⏱️ {route.durationMinutes} dk</ThemedText>
          <ThemedText style={styles.metaText}>📍 {route.distanceKm} km</ThemedText>
          <ThemedText style={styles.metaText}>👁️ {route.viewCount}</ThemedText>
        </View>
        
        {route.tags && route.tags.length > 0 && (
          <View style={styles.tagRow}>
            {route.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  searchSection: {
    padding: 20,
    gap: 12,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  citySelectedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityPlaceholderText: {
    fontSize: 16,
    opacity: 0.5,
  },
  chevron: {
    fontSize: 12,
  },
  cityDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 400,
    overflow: 'hidden',
  },
  searchInput: {
    padding: 12,
    borderBottomWidth: 1,
    fontSize: 16,
  },
  cityList: {
    maxHeight: 350,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cityItemActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  cityItemText: {
    fontSize: 16,
  },
  field: {
    marginTop: 12,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagClose: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  routesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routesCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  routesList: {
    paddingBottom: 100,
    gap: 16,
  },
  routeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  routeImage: {
    width: '100%',
    height: 180,
  },
  routeContent: {
    padding: 16,
    gap: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  routeDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
