/**
 * ROTA OLUŞTURMA EKRANI
 * 
 * 3 Aşamalı Form:
 * 1. Temel Bilgiler + Şehir Seçimi
 * 2. Duraklar & Mekanlar
 * 3. Görsel Yükleme & Yayınlama
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { turkeyCities } from '@/data/turkey-cities-districts';
import { imageUploadService } from '@/services/image-upload.service';
import { routesService } from '@/services/routes.service';
import type { CreateRouteInput, RouteStop } from '@/types';

export default function CreateRouteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Step 1: Temel Bilgiler
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtIds, setDistrictIds] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [difficulty] = useState<'easy' | 'moderate' | 'challenging'>('easy');
  const [budgetRange] = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [distanceKm, setDistanceKm] = useState('5');

  // Step 2: Duraklar
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [stopHighlight, setStopHighlight] = useState('');
  const [stopNotes, setStopNotes] = useState('');
  const [stopDuration, setStopDuration] = useState('30');

  // Step 3: Görseller
  const [coverImage, setCoverImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  const selectedCity = turkeyCities.find(c => c.id === cityId);

  const handleNext = () => {
    if (step === 1) {
      if (!title || !cityId || !description) {
        Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun.');
        return;
      }
    }

    if (step === 2) {
      if (stops.length === 0) {
        Alert.alert('Durak Ekle', 'En az 1 durak eklemelisiniz.');
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleAddStop = () => {
    if (!stopHighlight) {
      Alert.alert('Hata', 'Lütfen durak açıklaması girin.');
      return;
    }

    const newStop: RouteStop = {
      order: stops.length + 1,
      placeId: '',
      tastingNotes: stopNotes ? [stopNotes] : [],
      highlight: stopHighlight,
      dwellMinutes: parseInt(stopDuration) || 30,
    };

    setStops([...stops, newStop]);
    setStopHighlight('');
    setStopNotes('');
    setStopDuration('30');
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    const reorderedStops = newStops.map((stop, i) => ({ ...stop, order: i + 1 }));
    setStops(reorderedStops);
  };

  const handleUploadCover = async () => {
    if (!user) return;

    setLoading(true);
    const result = await imageUploadService.uploadRouteCoverImage(user.id);
    setLoading(false);

    if (result.success && result.url) {
      setCoverImage(result.url);
    } else {
      Alert.alert('Hata', result.error || 'Görsel yüklenemedi.');
    }
  };

  const handleUploadMultiple = async () => {
    if (!user) return;

    setLoading(true);
    const results = await imageUploadService.uploadRouteImages(user.id, 5);
    setLoading(false);

    const successUrls = results.filter((r) => r.success && r.url).map((r) => r.url!);
    if (successUrls.length > 0) {
      setAdditionalImages([...additionalImages, ...successUrls]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Rota oluşturmak için giriş yapmalısınız.');
      return;
    }

    if (!coverImage) {
      Alert.alert('Kapak Görseli', 'Lütfen bir kapak görseli ekleyin.');
      return;
    }

    const routeData: CreateRouteInput = {
      cityId,
      districtIds,
      title,
      description,
      coverImage,
      images: additionalImages,
      durationMinutes: parseInt(durationMinutes) || 120,
      distanceKm: parseFloat(distanceKm) || 5,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      difficulty,
      budgetRange,
      stops,
    };

    setLoading(true);
    const result = await routesService.createRoute(routeData, user.id);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Başarılı!',
        'Rotanız oluşturuldu. Moderasyon sonrası yayınlanacak.',
        [
          {
            text: 'Tamam',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      );
    } else {
      Alert.alert('Hata', result.error?.message || 'Rota oluşturulamadı.');
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authPrompt}>
          <ThemedText type="subtitle">Giriş Gerekli</ThemedText>
          <ThemedText style={styles.authText}>
            Rota oluşturmak için lütfen giriş yapın.
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
            onPress={() => router.push('/auth/login')}>
            <ThemedText style={styles.buttonText} lightColor="#FFFFFF">
              Giriş Yap
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress */}
      <View style={styles.progressBar}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              {
                backgroundColor:
                  s <= step ? Colors[colorScheme].primary : Colors[colorScheme].border,
              },
            ]}
          />
        ))}
      </View>

      <ThemedView style={styles.content}>
        <ThemedText type="title">
          {step === 1 && 'Temel Bilgiler'}
          {step === 2 && 'Duraklar'}
          {step === 3 && 'Görseller & Yayın'}
        </ThemedText>

        {/* Step 1: Temel Bilgiler */}
        {step === 1 && (
          <View style={styles.formSection}>
            <InputGroup
              label="Rota Başlığı *"
              placeholder="Örn: İstanbul Sokak Lezzetleri"
              value={title}
              onChangeText={setTitle}
              colorScheme={colorScheme}
            />

            <InputGroup
              label="Açıklama *"
              placeholder="Rotanızı kısaca tanıtın..."
              value={description}
              onChangeText={setDescription}
              multiline
              colorScheme={colorScheme}
            />

            {/* Şehir Seçimi - Buton */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Şehir *</ThemedText>
              <Pressable
                style={[
                  styles.cityPickerButton,
                  { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].cardBackground }
                ]}
                onPress={() => setShowCityPicker(!showCityPicker)}>
                <ThemedText style={selectedCity ? styles.citySelectedText : styles.cityPlaceholderText}>
                  {selectedCity ? selectedCity.name : 'Şehir seçin...'}
                </ThemedText>
                <ThemedText style={styles.chevron}>{showCityPicker ? '▲' : '▼'}</ThemedText>
              </Pressable>
            </View>

            {/* Şehir Listesi */}
            {showCityPicker && (
              <ScrollView style={styles.cityList} nestedScrollEnabled>
                {turkeyCities.map((city) => (
                  <Pressable
                    key={city.id}
                    style={[
                      styles.cityListItem,
                      cityId === city.id && { backgroundColor: Colors[colorScheme].badgeOrange },
                      { borderBottomColor: Colors[colorScheme].border }
                    ]}
                    onPress={() => {
                      setCityId(city.id);
                      setShowCityPicker(false);
                    }}>
                    <ThemedText style={styles.cityListItemText}>{city.name}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Süre (dk)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: Colors[colorScheme].border,
                      backgroundColor: Colors[colorScheme].cardBackground,
                      color: Colors[colorScheme].text,
                    },
                  ]}
                  placeholder="120"
                  placeholderTextColor={Colors[colorScheme].textLight}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Mesafe (km)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: Colors[colorScheme].border,
                      backgroundColor: Colors[colorScheme].cardBackground,
                      color: Colors[colorScheme].text,
                    },
                  ]}
                  placeholder="5"
                  placeholderTextColor={Colors[colorScheme].textLight}
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <InputGroup
              label="Etiketler (virgülle ayırın)"
              placeholder="kebap, sokak lezzeti, gurme"
              value={tags}
              onChangeText={setTags}
              colorScheme={colorScheme}
            />
          </View>
        )}

        {/* Step 2: Duraklar */}
        {step === 2 && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionDesc}>
              Rotanıza duraklar ekleyin. Her durak için açıklama ve süre girin.
            </ThemedText>

            {stops.length > 0 && (
              <View style={styles.stopsList}>
                {stops.map((stop, index) => (
                  <View
                    key={index}
                    style={[styles.stopItem, { borderColor: Colors[colorScheme].border }]}>
                    <View style={styles.stopNumber}>
                      <ThemedText style={styles.stopNumberText}>{index + 1}</ThemedText>
                    </View>
                    <View style={styles.stopInfo}>
                      <ThemedText style={styles.stopText}>{stop.highlight}</ThemedText>
                      <ThemedText style={styles.stopMeta}>⏱️ {stop.dwellMinutes} dk</ThemedText>
                    </View>
                    <Pressable onPress={() => handleRemoveStop(index)}>
                      <ThemedText style={styles.removeButton}>❌</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <InputGroup
              label="Durak Açıklaması"
              placeholder="Örn: Karaköy'de Karadeniz Döner"
              value={stopHighlight}
              onChangeText={setStopHighlight}
              colorScheme={colorScheme}
            />

            <InputGroup
              label="Tadım Notları (opsiyonel)"
              placeholder="Örn: Tereyağlı döner dürüm"
              value={stopNotes}
              onChangeText={setStopNotes}
              colorScheme={colorScheme}
            />

            <InputGroup
              label="Süre (dakika)"
              placeholder="30"
              value={stopDuration}
              onChangeText={setStopDuration}
              keyboardType="numeric"
              colorScheme={colorScheme}
            />

            <Pressable
              style={[styles.addButton, { backgroundColor: Colors[colorScheme].accent }]}
              onPress={handleAddStop}>
              <ThemedText style={styles.addButtonText}>+ Durak Ekle</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Step 3: Görseller */}
        {step === 3 && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionDesc}>
              Rotanız için görseller ekleyin. Kapak görseli zorunludur.
            </ThemedText>

            <View style={styles.imageSection}>
              <ThemedText style={styles.label}>Kapak Görseli *</ThemedText>
              {coverImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                  <Pressable
                    style={styles.changeImageButton}
                    onPress={handleUploadCover}
                    disabled={loading}>
                    <ThemedText style={styles.changeImageText}>Değiştir</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.uploadButton,
                    { borderColor: Colors[colorScheme].border },
                  ]}
                  onPress={handleUploadCover}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={Colors[colorScheme].primary} />
                  ) : (
                    <>
                      <ThemedText style={styles.uploadIcon}>📷</ThemedText>
                      <ThemedText style={styles.uploadText}>Kapak Görseli Ekle</ThemedText>
                    </>
                  )}
                </Pressable>
              )}
            </View>

            <View style={styles.imageSection}>
              <ThemedText style={styles.label}>Ek Görseller (maks 5)</ThemedText>
              <Pressable
                style={[styles.uploadButton, { borderColor: Colors[colorScheme].border }]}
                onPress={handleUploadMultiple}
                disabled={loading || additionalImages.length >= 5}>
                {loading ? (
                  <ActivityIndicator color={Colors[colorScheme].primary} />
                ) : (
                  <>
                    <ThemedText style={styles.uploadIcon}>🖼️</ThemedText>
                    <ThemedText style={styles.uploadText}>Ek Görseller Ekle</ThemedText>
                  </>
                )}
              </Pressable>

              {additionalImages.length > 0 && (
                <View style={styles.additionalImages}>
                  {additionalImages.map((img, i) => (
                    <Image key={i} source={{ uri: img }} style={styles.additionalImage} />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navigation}>
          {step > 1 && (
            <Pressable
              style={[styles.navButton, { backgroundColor: Colors[colorScheme].border }]}
              onPress={() => setStep(step - 1)}>
              <ThemedText style={styles.navButtonText}>← Geri</ThemedText>
            </Pressable>
          )}

          {step < 3 ? (
            <Pressable
              style={[
                styles.navButton,
                styles.nextButton,
                { backgroundColor: Colors[colorScheme].primary },
              ]}
              onPress={handleNext}>
              <ThemedText style={styles.navButtonText} lightColor="#FFFFFF">
                İleri →
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.navButton,
                styles.nextButton,
                { backgroundColor: Colors[colorScheme].secondary },
              ]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.navButtonText} lightColor="#FFFFFF">
                  Yayınla 🚀
                </ThemedText>
              )}
            </Pressable>
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function InputGroup({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  colorScheme,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  colorScheme: 'light' | 'dark';
}) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          {
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].cardBackground,
            color: Colors[colorScheme].text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].textLight}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  authText: {
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  formSection: {
    gap: 16,
  },
  sectionDesc: {
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  cityPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cityPlaceholderText: {
    fontSize: 16,
    opacity: 0.5,
  },
  citySelectedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 12,
  },
  cityList: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cityListItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cityListItemText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  stopsList: {
    gap: 12,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stopInfo: {
    flex: 1,
    gap: 4,
  },
  stopText: {
    fontWeight: '600',
  },
  stopMeta: {
    fontSize: 12,
  },
  removeButton: {
    fontSize: 18,
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  imageSection: {
    gap: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: {
    fontSize: 48,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
  },
  imagePreview: {
    gap: 12,
  },
  coverPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changeImageButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  additionalImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButton: {
    flex: 2,
  },
  navButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
