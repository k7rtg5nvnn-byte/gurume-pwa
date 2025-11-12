/**
 * ROTA OLUŞTURMA - YENİ TASARIM
 * 
 * Hızlı, kolay, modern
 * - Başlık otomatik (opsiyonel)
 * - Her mekan için görsel + rating
 * - Açıklama opsiyonel
 * - Submit sonrası reset
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { routesService } from '@/services/routes.service';
import { imageUploadService } from '@/services/image-upload.service';
import { placesService } from '@/services/places.service';

interface StopRating {
  cleanliness: number; // Temizlik (1-5)
  price: number; // Fiyat Performans (1-5)
  quality: number; // Kalite (1-5)
  speed: number; // Hız/Servis (1-5)
}

interface Stop {
  order: number;
  placeName: string;
  placeAddress?: string;
  notes: string;
  duration: number;
  googlePlaceId?: string;
  image?: string; // Her mekan için ayrı görsel
  rating?: StopRating; // Her mekan için rating
}

export default function CreateRouteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Şehir Seçimi (basit!)
  const [cityId, setCityId] = useState('');
  const [districtIds, setDistrictIds] = useState<string[]>([]);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // Step 2: Mekanlar (her biri rating + görsel ile)
  const [stops, setStops] = useState<Stop[]>([]);
  const [currentPlaceName, setCurrentPlaceName] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [currentDuration, setCurrentDuration] = useState('30');
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  
  // Rating state for current stop
  const [currentRating, setCurrentRating] = useState<StopRating>({
    cleanliness: 5,
    price: 5,
    quality: 5,
    speed: 5,
  });
  const [currentStopImage, setCurrentStopImage] = useState('');

  // Step 3: Final (opsiyonel bilgiler)
  const [title, setTitle] = useState(''); // Opsiyonel
  const [description, setDescription] = useState(''); // Opsiyonel
  const [coverImage, setCoverImage] = useState('');

  const selectedCity = turkeyCities.find(c => c.id === cityId);
  const selectedDistricts = selectedCity?.districts.filter(d => districtIds.includes(d.id)) || [];

  // Form reset fonksiyonu
  const resetForm = () => {
    setStep(1);
    setCityId('');
    setDistrictIds([]);
    setStops([]);
    setTitle('');
    setDescription('');
    setCoverImage('');
    setCurrentPlaceName('');
    setCurrentNotes('');
    setCurrentDuration('30');
    setPlaceSearch('');
    setPlaceResults([]);
    setCurrentRating({ cleanliness: 5, price: 5, quality: 5, speed: 5 });
    setCurrentStopImage('');
  };

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

  // ========== STEP 1: ŞEHİR SEÇİMİ ==========
  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>📍 Rotanız Hangi Şehirde?</ThemedText>

      {/* Şehir Seçici */}
      <Pressable
        style={[styles.pickerButton, { 
          borderColor: Colors[colorScheme].border,
          backgroundColor: Colors[colorScheme].cardBackground 
        }]}
        onPress={() => setShowCityPicker(!showCityPicker)}>
        <ThemedText style={styles.pickerButtonText}>
          {selectedCity ? `${selectedCity.name}` : 'Şehir Seç *'}
        </ThemedText>
        <ThemedText style={styles.pickerButtonIcon}>
          {showCityPicker ? '▲' : '▼'}
        </ThemedText>
      </Pressable>

      {showCityPicker && (
        <ScrollView style={[styles.pickerDropdown, { 
          borderColor: Colors[colorScheme].border,
          backgroundColor: Colors[colorScheme].cardBackground,
          maxHeight: 300 
        }]}>
          {turkeyCities.map((city) => (
            <Pressable
              key={city.id}
              style={[styles.pickerItem, cityId === city.id && { backgroundColor: Colors[colorScheme].primary + '20' }]}
              onPress={() => {
                setCityId(city.id);
                setDistrictIds([]);
                setShowCityPicker(false);
                setShowDistrictPicker(true);
              }}>
              <ThemedText style={styles.pickerItemText}>{city.name}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* İlçe Seçici (opsiyonel) */}
      {selectedCity && (
        <>
          <Pressable
            style={[styles.pickerButton, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground,
              marginTop: 12 
            }]}
            onPress={() => setShowDistrictPicker(!showDistrictPicker)}>
            <ThemedText style={styles.pickerButtonText}>
              {selectedDistricts.length > 0 
                ? `${selectedDistricts.length} İlçe Seçildi` 
                : 'İlçe Seç (Opsiyonel)'}
            </ThemedText>
            <ThemedText style={styles.pickerButtonIcon}>
              {showDistrictPicker ? '▲' : '▼'}
            </ThemedText>
          </Pressable>

          {showDistrictPicker && (
            <ScrollView style={[styles.pickerDropdown, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground,
              maxHeight: 200 
            }]}>
              {selectedCity.districts.map((district) => {
                const isSelected = districtIds.includes(district.id);
                return (
                  <Pressable
                    key={district.id}
                    style={[styles.pickerItem, isSelected && { backgroundColor: Colors[colorScheme].primary + '20' }]}
                    onPress={() => {
                      if (isSelected) {
                        setDistrictIds(districtIds.filter(id => id !== district.id));
                      } else {
                        setDistrictIds([...districtIds, district.id]);
                      }
                    }}>
                    <ThemedText style={styles.pickerItemText}>
                      {isSelected ? '✓ ' : ''}{district.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {selectedDistricts.length > 0 && (
            <View style={styles.tagRow}>
              {selectedDistricts.map((district) => (
                <View key={district.id} style={[styles.tag, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
                  <ThemedText style={styles.tagText}>{district.name}</ThemedText>
                  <Pressable onPress={() => setDistrictIds(districtIds.filter(id => id !== district.id))}>
                    <ThemedText style={styles.tagRemove}> ✕</ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={styles.stepActions}>
        <Pressable
          style={[styles.button, { 
            backgroundColor: Colors[colorScheme].primary,
            opacity: !cityId ? 0.5 : 1 
          }]}
          onPress={() => {
            if (!cityId) {
              Alert.alert('Şehir Seç', 'Lütfen bir şehir seçin.');
              return;
            }
            setStep(2);
          }}
          disabled={!cityId}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
            İleri: Mekanları Ekle →
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );

  // ========== STEP 2: MEKANLAR (RATING + GÖRSEL) ==========
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
    setPlaceSearch('');
    setPlaceResults([]);
  };

  const handlePickStopImage = async () => {
    try {
      setLoading(true);
      const result = await imageUploadService.uploadRouteCoverImage(user.id);
      
      if (result.success && result.url) {
        setCurrentStopImage(result.url);
        Alert.alert('Başarılı', 'Mekan görseli yüklendi!');
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
      image: currentStopImage,
      rating: { ...currentRating },
    };

    setStops([...stops, newStop]);
    setCurrentPlaceName('');
    setCurrentNotes('');
    setCurrentDuration('30');
    setCurrentStopImage('');
    setCurrentRating({ cleanliness: 5, price: 5, quality: 5, speed: 5 });
    Alert.alert('Eklendi!', 'Mekan listeye eklendi. Devam edebilirsiniz.');
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setStops(updated);
  };

  const renderRatingStars = (ratingKey: keyof StopRating, label: string) => {
    const value = currentRating[ratingKey];
    return (
      <View style={styles.ratingRow}>
        <ThemedText style={styles.ratingLabel}>{label}</ThemedText>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setCurrentRating({ ...currentRating, [ratingKey]: star })}>
              <ThemedText style={styles.star}>{star <= value ? '⭐' : '☆'}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>🍽️ Mekanları Ekle</ThemedText>
      
      {/* Google Maps Arama */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>🗺️ Mekan Ara</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Restoran, kafe, mekan adı..."
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={placeSearch}
          onChangeText={handleSearchPlaces}
        />
        {searchingPlaces && <ActivityIndicator size="small" color={Colors[colorScheme].primary} />}
        {placeResults.length > 0 && (
          <ScrollView style={[styles.searchResults, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground 
          }]}>
            {placeResults.map((place, idx) => (
              <Pressable
                key={idx}
                style={styles.searchResultItem}
                onPress={() => handleSelectPlace(place)}>
                <ThemedText style={styles.searchResultName}>{place.name}</ThemedText>
                <ThemedText style={styles.searchResultAddress}>{place.address}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Mekan Adı */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Mekan Adı *</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Örn: Hacı Abdullah"
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={currentPlaceName}
          onChangeText={setCurrentPlaceName}
        />
      </View>

      {/* Mekan Görseli */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>📸 Mekan Görseli</ThemedText>
        {currentStopImage ? (
          <View>
            <Image source={{ uri: currentStopImage }} style={styles.stopImagePreview} contentFit="cover" />
            <Pressable
              style={[styles.buttonSecondary, { 
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].cardBackground,
                marginTop: 8 
              }]}
              onPress={handlePickStopImage}>
              <ThemedText style={styles.buttonSecondaryText}>🔄 Değiştir</ThemedText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.uploadButton, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground 
            }]}
            onPress={handlePickStopImage}>
            <ThemedText style={styles.uploadButtonText}>📷 Görsel Ekle</ThemedText>
          </Pressable>
        )}
      </View>

      {/* Rating Sistemi */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>⭐ Değerlendirme</ThemedText>
        {renderRatingStars('cleanliness', '🧼 Temizlik')}
        {renderRatingStars('price', '💰 Fiyat/Performans')}
        {renderRatingStars('quality', '🏆 Kalite')}
        {renderRatingStars('speed', '⚡ Hız/Servis')}
      </View>

      {/* Notlar */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>📝 Notlar (Opsiyonel)</ThemedText>
        <TextInput
          style={[styles.textarea, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Bu mekanda ne denediniz? Tavsiyeniz nedir?"
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={currentNotes}
          onChangeText={setCurrentNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Süre */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>⏱️ Ortalama Süre (dk)</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="30"
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={currentDuration}
          onChangeText={setCurrentDuration}
          keyboardType="number-pad"
        />
      </View>

      {/* Ekle Butonu */}
      <Pressable
        style={[styles.button, { backgroundColor: Colors[colorScheme].primary, marginBottom: 20 }]}
        onPress={handleAddStop}>
        <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
          ➕ Mekanı Ekle
        </ThemedText>
      </Pressable>

      {/* Eklenen Mekanlar Listesi */}
      {stops.length > 0 && (
        <View style={styles.stopsListContainer}>
          <ThemedText style={styles.stopsListTitle}>✅ Eklenen Mekanlar ({stops.length})</ThemedText>
          {stops.map((stop, index) => (
            <View key={index} style={[styles.stopCard, { 
              borderColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].cardBackground 
            }]}>
              {stop.image && (
                <Image source={{ uri: stop.image }} style={styles.stopCardImage} contentFit="cover" />
              )}
              <View style={styles.stopCardContent}>
                <ThemedText style={styles.stopCardTitle}>
                  {index + 1}. {stop.placeName}
                </ThemedText>
                {stop.rating && (
                  <ThemedText style={styles.stopCardRating}>
                    ⭐ {((stop.rating.cleanliness + stop.rating.price + stop.rating.quality + stop.rating.speed) / 4).toFixed(1)}
                  </ThemedText>
                )}
                {stop.notes && (
                  <ThemedText style={styles.stopCardNotes} numberOfLines={2}>{stop.notes}</ThemedText>
                )}
              </View>
              <Pressable onPress={() => handleRemoveStop(index)}>
                <ThemedText style={styles.stopCardRemove}>🗑️</ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Navigation Butonları */}
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
              Alert.alert('Mekan Gerekli', 'En az 1 mekan eklemelisiniz.');
              return;
            }
            setStep(3);
          }}
          disabled={stops.length === 0}>
          <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
            İleri: Tamamla →
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );

  // ========== STEP 3: FİNAL (KAPAK + OPSİYONEL) ==========
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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Otomatik başlık oluştur (yoksa)
      const autoTitle = title.trim() || `${selectedCity?.name} Lezzet Rotası`;

      // Kapak görseli yoksa ilk mekanın görselini kullan
      const finalCoverImage = coverImage || stops[0]?.image || 'https://picsum.photos/400/300';

      const routeInput = {
        cityId,
        districtIds,
        title: autoTitle,
        description: description.trim() || `${stops.length} mekan içeren ${selectedCity?.name} lezzet rotası`,
        coverImage: finalCoverImage,
        images: stops.filter(s => s.image).map(s => s.image!),
        durationMinutes: stops.reduce((sum, s) => sum + s.duration, 0),
        distanceKm: 5,
        tags: ['lezzet', selectedCity?.name.toLowerCase() || ''].filter(Boolean),
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

      const response = await routesService.createRoute(routeInput, user.id);

      if (response.success) {
        Alert.alert(
          'Başarılı! 🎉',
          'Rotanız oluşturuldu ve yayına girdi.',
          [
            { 
              text: 'Yeni Rota Oluştur', 
              onPress: () => resetForm() 
            },
            { 
              text: 'Rotaları Gör', 
              onPress: () => router.push('/(tabs)/explore') 
            }
          ]
        );
      } else {
        Alert.alert('Hata', response.error?.message || 'Rota oluşturulamadı.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Hata', 'Bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>✨ Son Dokunuşlar</ThemedText>

      {/* Başlık (Opsiyonel) */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>📝 Rota Başlığı (Opsiyonel)</ThemedText>
        <TextInput
          style={[styles.input, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder={`${selectedCity?.name} Lezzet Rotası (otomatik)`}
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Açıklama (Opsiyonel) */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>📄 Açıklama (Opsiyonel)</ThemedText>
        <TextInput
          style={[styles.textarea, { 
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text 
          }]}
          placeholder="Bu rota hakkında kısa bir açıklama..."
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Kapak Görseli (Opsiyonel) */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>🖼️ Kapak Görseli (Opsiyonel)</ThemedText>
        <ThemedText style={styles.helperText}>
          {stops[0]?.image ? 'Boş bırakırsanız ilk mekanın görseli kullanılır' : 'İlk mekanınıza görsel ekleyin veya buradan yükleyin'}
        </ThemedText>
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

      {/* Özet */}
      <View style={[styles.summaryCard, { 
        backgroundColor: Colors[colorScheme].cardBackground,
        borderColor: Colors[colorScheme].primary 
      }]}>
        <ThemedText style={styles.summaryTitle}>📊 Rota Özeti</ThemedText>
        <ThemedText style={styles.summaryText}>📍 Şehir: {selectedCity?.name}</ThemedText>
        {selectedDistricts.length > 0 && (
          <ThemedText style={styles.summaryText}>🏘️ İlçeler: {selectedDistricts.map(d => d.name).join(', ')}</ThemedText>
        )}
        <ThemedText style={styles.summaryText}>🍽️ Mekan Sayısı: {stops.length}</ThemedText>
        <ThemedText style={styles.summaryText}>⏱️ Toplam Süre: {stops.reduce((sum, s) => sum + s.duration, 0)} dk</ThemedText>
        <ThemedText style={styles.summaryText}>⭐ Ortalama Puan: {stops.length > 0 ? (
          stops.reduce((sum, s) => {
            if (!s.rating) return sum;
            return sum + (s.rating.cleanliness + s.rating.price + s.rating.quality + s.rating.speed) / 4;
          }, 0) / stops.length
        ).toFixed(1) : '0'}/5</ThemedText>
      </View>

      {/* Navigation Butonları */}
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
      <LinearGradient
        colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <ThemedText style={styles.headerTitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
          Yeni Rota Oluştur
        </ThemedText>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                { backgroundColor: step >= s ? '#FFFFFF' : 'rgba(255,255,255,0.3)' },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 30,
    height: 6,
    borderRadius: 3,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerButtonIcon: {
    fontSize: 16,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  pickerItemText: {
    fontSize: 15,
  },
  tagRow: {
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
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagRemove: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchResults: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchResultAddress: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  stopImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  coverImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 24,
  },
  stopsListContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  stopsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stopCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  stopCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  stopCardContent: {
    flex: 1,
  },
  stopCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  stopCardRating: {
    fontSize: 13,
    marginBottom: 2,
  },
  stopCardNotes: {
    fontSize: 12,
    opacity: 0.6,
  },
  stopCardRemove: {
    fontSize: 20,
    padding: 8,
  },
  summaryCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 6,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
