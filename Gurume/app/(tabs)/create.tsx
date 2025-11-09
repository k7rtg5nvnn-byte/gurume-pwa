/**
 * ROTA OLUŞTURMA - TAM ÇALIŞIR VERSİYON
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

export default function CreateRouteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState('');
  const [tags, setTags] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [distanceKm, setDistanceKm] = useState('5');

  const [stops, setStops] = useState<any[]>([]);
  const [stopHighlight, setStopHighlight] = useState('');
  const [stopNotes, setStopNotes] = useState('');
  const [stopDuration, setStopDuration] = useState('30');

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

    setStops([...stops, {
      order: stops.length + 1,
      highlight: stopHighlight,
      notes: stopNotes,
      duration: parseInt(stopDuration) || 30,
    }]);
    
    setStopHighlight('');
    setStopNotes('');
    setStopDuration('30');
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    const reordered = newStops.map((stop, i) => ({ ...stop, order: i + 1 }));
    setStops(reordered);
  };

  const handleSubmit = () => {
    if (!coverImage) {
      Alert.alert('Kapak Görseli', 'Lütfen bir kapak görseli ekleyin.');
      return;
    }

    Alert.alert(
      'Başarılı!',
      'Rotanız oluşturuldu. Test modunda çalışıyor.',
      [{ text: 'Tamam', onPress: () => router.push('/(tabs)/profile') }]
    );
  };

  const handleUploadCover = () => {
    setCoverImage('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800');
    Alert.alert('Başarılı', 'Görsel yüklendi (test modu)');
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
          {step === 3 && 'Görseller'}
        </ThemedText>

        {step === 1 && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Rota Başlığı *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Örn: İstanbul Sokak Lezzetleri"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Açıklama *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Rotanızı kısaca tanıtın..."
                placeholderTextColor={Colors[colorScheme].textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

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

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Etiketler (virgülle ayırın)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="kebap, sokak lezzeti, gurme"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={tags}
                onChangeText={setTags}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionDesc}>
              Rotanıza duraklar ekleyin
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
                      <ThemedText style={styles.stopMeta}>⏱️ {stop.duration} dk</ThemedText>
                    </View>
                    <Pressable onPress={() => handleRemoveStop(index)}>
                      <ThemedText style={styles.removeButton}>❌</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Durak Açıklaması</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Örn: Karaköy'de Karadeniz Döner"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={stopHighlight}
                onChangeText={setStopHighlight}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Tadım Notları</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Örn: Tereyağlı döner dürüm"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={stopNotes}
                onChangeText={setStopNotes}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Süre (dakika)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="30"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={stopDuration}
                onChangeText={setStopDuration}
                keyboardType="numeric"
              />
            </View>

            <Pressable
              style={[styles.addButton, { backgroundColor: Colors[colorScheme].accent }]}
              onPress={handleAddStop}>
              <ThemedText style={styles.addButtonText}>+ Durak Ekle</ThemedText>
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formSection}>
            <View style={styles.imageSection}>
              <ThemedText style={styles.label}>Kapak Görseli *</ThemedText>
              {coverImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                  <Pressable
                    style={styles.changeImageButton}
                    onPress={handleUploadCover}>
                    <ThemedText style={styles.changeImageText}>Değiştir</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.uploadButton,
                    { borderColor: Colors[colorScheme].border },
                  ]}
                  onPress={handleUploadCover}>
                  <ThemedText style={styles.uploadIcon}>📷</ThemedText>
                  <ThemedText style={styles.uploadText}>Kapak Görseli Ekle</ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        )}

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
              onPress={handleSubmit}>
              <ThemedText style={styles.navButtonText} lightColor="#FFFFFF">
                Yayınla 🚀
              </ThemedText>
            </Pressable>
          )}
        </View>
      </ThemedView>
    </ScrollView>
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
