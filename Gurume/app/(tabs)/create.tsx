/**
 * ROTA OLUŞTURMA - YENİDEN TASARIM
 * 
 * Basit, kullanışlı, adım adım
 * - İl/İlçe seçimi çalışıyor
 * - Google Maps entegrasyonu aktif
 * - Temiz UI
 */

import React, { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { routesService } from '@/services/routes.service';
import { imageUploadService } from '@/services/image-upload.service';
import { placesService } from '@/services/places.service';

interface Stop {
  order: number;
  placeName: string;
  placeAddress?: string;
  notes: string;
  duration: number;
  googlePlaceId?: string;
}

export default function CreateRouteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Temel Bilgiler
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtIds, setDistrictIds] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [tags, setTags] = useState('');

  // Step 2: Duraklar
  const [stops, setStops] = useState<Stop[]>([]);
  const [currentPlaceName, setCurrentPlaceName] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentDuration, setCurrentDuration] = useState('30');
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  // Step 3: Görseller
  const [coverImage, setCoverImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // UI State
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  const selectedCity = turkeyCities.find(c => c.id === cityId);
  const selectedDistricts = selectedCity?.districts.filter(d => districtIds.includes(d.id)) || [];

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          Rota oluşturmak için giriş yapmalısınız.
        </ThemedText>
        <Pressable
          style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => router.push('/auth/login')}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
            Giriş Yap
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // ========== STEP 1: TEMEL BİLGİLER ==========
  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>📝 Temel Bilgiler</ThemedText>

      {/* Başlık */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Rota Başlığı *</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Örn: Ankara'nın En İyi Kahvecileri"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Şehir Seçimi */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>📍 Şehir *</ThemedText>
        <Pressable
          style={[styles.picker, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground 
          }]}
          onPress={() => setShowCityPicker(!showCityPicker)}>
          <ThemedText style={selectedCity ? styles.pickerSelected : styles.pickerPlaceholder}>
            {selectedCity ? selectedCity.name : 'Şehir seçin'}
          </ThemedText>
          <ThemedText>{showCityPicker ? '▲' : '▼'}</ThemedText>
        </Pressable>

        {showCityPicker && (
          <ScrollView 
            style={[styles.dropdown, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground 
            }]}
            nestedScrollEnabled>
            {turkeyCities.map((city) => (
              <Pressable
                key={city.id}
                style={[
                  styles.dropdownItem,
                  city.id === cityId && styles.dropdownItemActive,
                  { borderBottomColor: Colors[colorScheme].border }
                ]}
                onPress={() => {
                  setCityId(city.id);
                  setDistrictIds([]);
                  setShowCityPicker(false);
                }}>
                <ThemedText>{city.name}</ThemedText>
                {city.id === cityId && <ThemedText>✓</ThemedText>}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* İlçe Seçimi - Sadece şehir seçildiyse göster */}
      {selectedCity && (
        <View style={styles.field}>
          <ThemedText style={styles.label}>🏘️ İlçeler (Opsiyonel)</ThemedText>
          <Pressable
            style={[styles.picker, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground 
            }]}
            onPress={() => setShowDistrictPicker(!showDistrictPicker)}>
            <ThemedText style={districtIds.length > 0 ? styles.pickerSelected : styles.pickerPlaceholder}>
              {districtIds.length > 0 
                ? `${districtIds.length} ilçe seçildi` 
                : 'İlçe seçin (çoklu)'}
            </ThemedText>
            <ThemedText>{showDistrictPicker ? '▲' : '▼'}</ThemedText>
          </Pressable>

          {showDistrictPicker && (
            <ScrollView 
              style={[styles.dropdown, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground 
              }]}
              nestedScrollEnabled>
              {selectedCity.districts.map((district) => {
                const isSelected = districtIds.includes(district.id);
                return (
                  <Pressable
                    key={district.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      { borderBottomColor: Colors[colorScheme].border }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setDistrictIds(districtIds.filter(id => id !== district.id));
                      } else {
                        setDistrictIds([...districtIds, district.id]);
                      }
                    }}>
                    <ThemedText>{district.name}</ThemedText>
                    {isSelected && <ThemedText>✓</ThemedText>}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {selectedDistricts.length > 0 && (
            <View style={styles.selectedTags}>
              {selectedDistricts.map((district) => (
                <View key={district.id} style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                  <ThemedText style={styles.tagText}>{district.name}</ThemedText>
                  <Pressable onPress={() => setDistrictIds(districtIds.filter(id => id !== district.id))}>
                    <ThemedText style={styles.tagClose}> ✕</ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Açıklama */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Açıklama *</ThemedText>
        <TextInput
          style={[styles.textarea, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Rotanızı kısaca tanıtın..."
          placeholderTextColor={Colors[colorScheme].textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Süre */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>⏱️ Tahmini Süre (dk)</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="120"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
        />
      </View>

      {/* Etiketler */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>🏷️ Etiketler (virgülle ayırın)</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Örn: kahve, tatlı, romantik"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <Pressable
        style={[styles.button, { 
          backgroundColor: Colors[colorScheme].primary,
          opacity: (!title || !cityId || !description) ? 0.5 : 1 
        }]}
        onPress={() => {
          if (!title || !cityId || !description) {
            Alert.alert('Eksik Bilgi', 'Lütfen zorunlu (*) alanları doldurun.');
            return;
          }
          setStep(2);
        }}
        disabled={!title || !cityId || !description}>
        <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
          İleri: Duraklar Ekle →
        </ThemedText>
      </Pressable>
    </ScrollView>
  );

  // ========== STEP 2: DURAKLAR ==========
  const handleSearchPlaces = async (query: string) => {
    setPlaceSearch(query);
    
    if (query.length < 3) {
      setPlaceResults([]);
      return;
    }

    try {
      setSearchingPlaces(true);
      const searchQuery = selectedCity ? `${query}, ${selectedCity.name}` : query;
      const results = await placesService.searchPlaces({ query: searchQuery });
      setPlaceResults(results);
    } catch (error) {
      console.error('Search places error:', error);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setCurrentPlaceName(place.name || '');
    setCurrentNotes(place.address || '');
    setPlaceSearch('');
    setPlaceResults([]);
  };

  const handleAddStop = () => {
    if (!currentPlaceName.trim()) {
      Alert.alert('Hata', 'Lütfen mekan adı girin.');
      return;
    }

    const newStop: Stop = {
      order: stops.length + 1,
      placeName: currentPlaceName.trim(),
      notes: currentNotes.trim(),
      duration: parseInt(currentDuration) || 30,
    };

    setStops([...stops, newStop]);
    setCurrentPlaceName('');
    setCurrentNotes('');
    setCurrentDuration('30');
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setStops(updated);
  };

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>📍 Duraklar Ekle</ThemedText>
      
      {/* Google Maps Arama */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>🗺️ Google Maps'ten Ara</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Mekan adı yazın..."
          placeholderTextColor={Colors[colorScheme].textLight}
          value={placeSearch}
          onChangeText={handleSearchPlaces}
        />
        
        {searchingPlaces && (
          <View style={styles.searchingIndicator}>
            <ActivityIndicator size="small" color={Colors[colorScheme].primary} />
            <ThemedText style={styles.searchingText}>Aranıyor...</ThemedText>
          </View>
        )}

        {placeResults.length > 0 && (
          <ScrollView style={[styles.placeResults, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground 
          }]} nestedScrollEnabled>
            {placeResults.map((place, idx) => (
              <Pressable
                key={idx}
                style={[styles.placeResultItem, { borderBottomColor: Colors[colorScheme].border }]}
                onPress={() => handleSelectPlace(place)}>
                <ThemedText style={styles.placeName}>{place.name}</ThemedText>
                <ThemedText style={styles.placeAddress} numberOfLines={1}>
                  {place.address}
                </ThemedText>
                {place.rating && (
                  <ThemedText style={styles.placeRating}>⭐ {place.rating}</ThemedText>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Manuel Durak Ekleme */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Mekan Adı *</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Örn: Kahve Dünyası Kızılay"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={currentPlaceName}
          onChangeText={setCurrentPlaceName}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Notlar (Opsiyonel)</ThemedText>
        <TextInput
          style={[styles.textarea, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Örn: Filtre kahve denenmeli, kek harika!"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={currentNotes}
          onChangeText={setCurrentNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>⏱️ Süre (dk)</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="30"
          placeholderTextColor={Colors[colorScheme].textLight}
          value={currentDuration}
          onChangeText={setCurrentDuration}
          keyboardType="numeric"
        />
      </View>

      <Pressable
        style={[styles.buttonSecondary, { 
          borderColor: Colors[colorScheme].primary,
          backgroundColor: Colors[colorScheme].cardBackground 
        }]}
        onPress={handleAddStop}>
        <ThemedText style={[styles.buttonSecondaryText, { color: Colors[colorScheme].primary }]}>
          ➕ Durak Ekle
        </ThemedText>
      </Pressable>

      {/* Eklenen Duraklar */}
      {stops.length > 0 && (
        <View style={styles.stopsList}>
          <ThemedText style={styles.subsectionTitle}>Eklenen Duraklar ({stops.length})</ThemedText>
          {stops.map((stop, idx) => (
            <View key={idx} style={[styles.stopCard, { 
              backgroundColor: Colors[colorScheme].cardBackground,
              borderColor: Colors[colorScheme].border 
            }]}>
              <View style={styles.stopHeader}>
                <ThemedText style={styles.stopOrder}>{stop.order}.</ThemedText>
                <ThemedText style={styles.stopName}>{stop.placeName}</ThemedText>
                <Pressable onPress={() => handleRemoveStop(idx)}>
                  <ThemedText style={styles.removeButton}>🗑️</ThemedText>
                </Pressable>
              </View>
              {stop.notes && (
                <ThemedText style={styles.stopNotes}>{stop.notes}</ThemedText>
              )}
              <ThemedText style={styles.stopDuration}>⏱️ {stop.duration} dk</ThemedText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.stepActions}>
        <Pressable
          style={[styles.buttonSecondary, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            flex: 1 
          }]}
          onPress={() => setStep(1)}>
          <ThemedText style={styles.buttonSecondaryText}>← Geri</ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.button, { 
            backgroundColor: Colors[colorScheme].primary,
            flex: 2,
            opacity: stops.length === 0 ? 0.5 : 1 
          }]}
          onPress={() => {
            if (stops.length === 0) {
              Alert.alert('Durak Gerekli', 'En az 1 durak eklemelisiniz.');
              return;
            }
            setStep(3);
          }}
          disabled={stops.length === 0}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
            İleri: Görseller →
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );

  // ========== STEP 3: GÖRSELLER ==========
  const handlePickCoverImage = async () => {
    try {
      setLoading(true);
      const result = await imageUploadService.uploadRouteCoverImage(user.id);
      
      if (result.success && result.url) {
        setCoverImage(result.url);
        Alert.alert('Başarılı', 'Kapak görseli yüklendi!');
      } else {
        Alert.alert('Hata', result.error || 'Görsel yüklenemedi.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Hata', 'Görsel yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>🖼️ Görseller</ThemedText>

      {/* Kapak Görseli */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Kapak Görseli *</ThemedText>
        {coverImage ? (
          <View>
            <Image source={{ uri: coverImage }} style={styles.coverImagePreview} contentFit="cover" />
            <Pressable
              style={[styles.buttonSecondary, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground,
                marginTop: 12 
              }]}
              onPress={handlePickCoverImage}>
              <ThemedText style={styles.buttonSecondaryText}>🔄 Değiştir</ThemedText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.uploadButton, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground 
            }]}
            onPress={handlePickCoverImage}>
            <ThemedText style={styles.uploadButtonText}>📷 Kapak Görseli Ekle</ThemedText>
          </Pressable>
        )}
      </View>

      <View style={styles.stepActions}>
        <Pressable
          style={[styles.buttonSecondary, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            flex: 1 
          }]}
          onPress={() => setStep(2)}>
          <ThemedText style={styles.buttonSecondaryText}>← Geri</ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.button, { 
            backgroundColor: Colors[colorScheme].primary,
            flex: 2,
            opacity: !coverImage ? 0.5 : 1 
          }]}
          onPress={() => {
            if (!coverImage) {
              Alert.alert('Kapak Görseli', 'Lütfen bir kapak görseli ekleyin.');
              return;
            }
            setStep(4);
          }}
          disabled={!coverImage}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
            İleri: Önizleme →
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );

  // ========== STEP 4: ÖNİZLEME & YAYINLA ==========
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const routeInput = {
        cityId,
        districtIds,
        title,
        description,
        coverImage,
        images: additionalImages,
        durationMinutes: parseInt(durationMinutes) || 120,
        distanceKm: 5,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        difficulty: 'easy' as const,
        budgetRange: 'moderate' as const,
        stops: stops.map((stop) => ({
          placeId: stop.googlePlaceId || null,
          order: stop.order,
          tastingNotes: [],
          highlight: stop.placeName,
          dwellMinutes: stop.duration,
          arrivalTime: null,
          transportMode: 'walking' as const,
          notes: stop.notes || '',
        })),
      };

      console.log('🚀 ROTA OLUŞTURULUYOR...');
      console.log('📦 RouteInput:', JSON.stringify(routeInput, null, 2));
      console.log('👤 UserId:', user.id);

      const response = await routesService.createRoute(routeInput, user.id);

      console.log('📥 RESPONSE:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('✅ ROTA BAŞARIYLA OLUŞTURULDU!');
        Alert.alert(
          'Başarılı! 🎉',
          'Rotanız oluşturuldu ve yayına girdi.',
          [{ text: 'Tamam', onPress: () => router.push('/(tabs)/explore') }]
        );
      } else {
        console.error('❌ ROTA OLUŞTURULAMADI:', response.error);
        Alert.alert('Hata', response.error?.message || 'Rota oluşturulamadı.');
      }
    } catch (error) {
      console.error('💥 SUBMIT ERROR:', error);
      console.error('💥 ERROR STACK:', error instanceof Error ? error.stack : 'No stack');
      Alert.alert('Hata', 'Bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>✅ Önizleme</ThemedText>

      <View style={[styles.previewCard, { 
        backgroundColor: Colors[colorScheme].cardBackground,
        borderColor: Colors[colorScheme].border 
      }]}>
        <Image source={{ uri: coverImage }} style={styles.previewImage} contentFit="cover" />
        
        <View style={styles.previewContent}>
          <ThemedText style={styles.previewTitle}>{title}</ThemedText>
          <ThemedText style={styles.previewCity}>
            📍 {selectedCity?.name}
            {selectedDistricts.length > 0 && ` - ${selectedDistricts.map(d => d.name).join(', ')}`}
          </ThemedText>
          <ThemedText style={styles.previewDescription}>{description}</ThemedText>
          
          <View style={styles.previewMeta}>
            <ThemedText style={styles.metaItem}>⏱️ {durationMinutes} dk</ThemedText>
            <ThemedText style={styles.metaItem}>📍 {stops.length} durak</ThemedText>
          </View>

          {tags && (
            <View style={styles.tagRow}>
              {tags.split(',').map((tag, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                  <ThemedText style={styles.tagText}>{tag.trim()}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.stepActions}>
        <Pressable
          style={[styles.buttonSecondary, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            flex: 1 
          }]}
          onPress={() => setStep(3)}>
          <ThemedText style={styles.buttonSecondaryText}>← Geri</ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.button, { 
            backgroundColor: Colors[colorScheme].primary,
            flex: 2 
          }]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
              🚀 Rotayı Yayınla
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
        style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Yeni Rota Oluştur
        </ThemedText>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && { backgroundColor: '#FFFFFF' },
                s > step && { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textarea: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerSelected: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerPlaceholder: {
    fontSize: 16,
    opacity: 0.5,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
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
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  searchingText: {
    fontSize: 14,
    opacity: 0.6,
  },
  placeResults: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
  },
  placeResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
  placeRating: {
    fontSize: 13,
    color: '#FF6B35',
  },
  stopsList: {
    marginTop: 24,
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  stopCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopOrder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  stopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    fontSize: 18,
  },
  stopNotes: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 28,
  },
  stopDuration: {
    fontSize: 13,
    opacity: 0.6,
    marginLeft: 28,
  },
  uploadButton: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coverImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewContent: {
    padding: 16,
    gap: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewCity: {
    fontSize: 15,
    opacity: 0.7,
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    fontSize: 14,
    opacity: 0.6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
