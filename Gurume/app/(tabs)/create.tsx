import React from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGurumeData } from '@/hooks/use-gurume-data';
import type { RouteStopInput } from '@/types';

export default function CreateRouteScreen() {
  const { profile, isSupabaseReady } = useAuth();
  const { data, createRoute } = useGurumeData();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [cityQuery, setCityQuery] = React.useState('');
  const [districtQuery, setDistrictQuery] = React.useState('');
  const [selectedCityId, setSelectedCityId] = React.useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<string | null>(null);
  const [coverImage, setCoverImage] = React.useState('');
  const [durationMinutes, setDurationMinutes] = React.useState('');
  const [distanceKm, setDistanceKm] = React.useState('');
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [stops, setStops] = React.useState<RouteStopDraft[]>([createEmptyStop(1)]);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const citySuggestions = React.useMemo(() => {
    if (!cityQuery.trim()) return data.cities.slice(0, 8);
    const lowered = cityQuery.toLowerCase();
    return data.cities.filter((city) => city.name.toLowerCase().includes(lowered)).slice(0, 8);
  }, [cityQuery, data.cities]);

  const districtSuggestions = React.useMemo(() => {
    if (!selectedCityId) return [];
    const districts = data.districts.filter((district) => district.cityId === selectedCityId);
    if (!districtQuery.trim()) return districts.slice(0, 8);
    const lowered = districtQuery.toLowerCase();
    return districts.filter((district) => district.name.toLowerCase().includes(lowered)).slice(0, 8);
  }, [data.districts, districtQuery, selectedCityId]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim();
    if (!cleanTag) return;
    if (tags.includes(cleanTag)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, cleanTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleAddStop = () => {
    setStops((prev) => [...prev, createEmptyStop(prev.length + 1)]);
  };

  const handleUpdateStop = (index: number, updates: Partial<RouteStopDraft>) => {
    setStops((prev) =>
      prev.map((stop, stopIndex) => (stopIndex === index ? { ...stop, ...updates } : stop)),
    );
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) =>
      prev
        .filter((_, stopIndex) => stopIndex !== index)
        .map((stop, idx) => ({
          ...stop,
          order: idx + 1,
        })),
    );
  };

  const handleSubmit = async () => {
    setStatusMessage(null);
    setErrorMessage(null);

    if (!selectedCityId) {
      setErrorMessage('Lütfen rota için bir şehir seç.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Rota başlığı zorunludur.');
      return;
    }

    const cleanedStops: RouteStopInput[] = stops
      .filter((stop) => stop.placeName.trim())
      .map((stop) => ({
        order: stop.order,
        placeName: stop.placeName.trim(),
        placeSummary: stop.summary.trim() || undefined,
        tastingNotes: stop.notes.filter(Boolean),
        highlight: stop.highlight.trim() || undefined,
        dwellMinutes: stop.dwellMinutes ? Number(stop.dwellMinutes) : undefined,
        latitude: stop.latitude ? Number(stop.latitude) : undefined,
        longitude: stop.longitude ? Number(stop.longitude) : undefined,
        priceLevel: stop.priceLevel || undefined,
        specialties: stop.specialties.filter(Boolean),
        imageUrl: stop.imageUrl || undefined,
      }));

    if (!cleanedStops.length) {
      setErrorMessage('En az bir durak eklemelisin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createRoute({
        title: title.trim(),
        summary: summary.trim() || undefined,
        description: summary.trim() || undefined,
        cityId: selectedCityId,
        districtIds: selectedDistrictId ? [selectedDistrictId] : [],
        coverImage: coverImage || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        tags,
        stops: cleanedStops,
        isPublished: isSupabaseReady && Boolean(profile),
      });

      if (result) {
        setStatusMessage(
          isSupabaseReady
            ? 'Rota kaydedildi! Moderasyon sonrası yayınlanacak.'
            : 'Rota cihazında taslak olarak saklandı (demo modu).',
        );

        setTimeout(() => {
          router.push(`/route/${result.id}`);
        }, 500);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Rota kaydedilirken bir sorun oluştu, lütfen tekrar dene.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile && isSupabaseReady) {
    return (
      <ThemedView style={styles.guard}>
        <ThemedText type="title">Rota oluşturmak için giriş yap</ThemedText>
        <ThemedText style={styles.guardCopy}>
          Rotanı kaydedip toplulukla paylaşabilmek için bir Gurume hesabına ihtiyacın var.
        </ThemedText>
        <Pressable
          style={[styles.guardButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={() => router.push('/sign-in')}>
          <ThemedText style={styles.guardButtonLabel} lightColor="#FFFFFF" darkColor="#1D1411">
            Giriş Yap
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title">Yeni Rota Oluştur</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Lezzet turunu planla; durakları, notları ve süreyi ekle. Hazır olduğunda paylaşabilirsin.
          </ThemedText>
          {isSupabaseReady ? null : (
            <View style={styles.banner}>
              <ThemedText style={styles.bannerTitle}>Demo Modu</ThemedText>
              <ThemedText style={styles.bannerCopy}>
                Supabase anahtarları tanımlanmadığı için rota yalnızca bu cihazda saklanır.
              </ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.card}>
          <Field label="Rota Başlığı">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Örn. İstanbul Anadolu Yakası Brunch Rotası"
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="Kısa Açıklama" helper="Rotanın ruhunu birkaç cümleyle anlat.">
            <TextInput
              value={summary}
              onChangeText={setSummary}
              multiline
              numberOfLines={3}
              placeholder="Sabah kahvaltısından gün batımına uzanan hafif lezzet durakları."
              style={[styles.input, styles.multiline, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="Şehir">
            <TextInput
              value={cityQuery}
              onChangeText={(text) => {
                setCityQuery(text);
                setSelectedCityId(null);
              }}
              placeholder="Şehir adı"
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
            <SuggestionList
              items={citySuggestions.map((city) => ({ id: city.id, label: city.name }))}
              onSelect={(id) => {
                const city = data.cities.find((item) => item.id === id);
                if (!city) return;
                setSelectedCityId(city.id);
                setCityQuery(city.name);
              }}
              selectedId={selectedCityId}
            />
          </Field>

          {selectedCityId ? (
            <Field label="İlçe">
              <TextInput
                value={districtQuery}
                onChangeText={(text) => {
                  setDistrictQuery(text);
                  setSelectedDistrictId(null);
                }}
                placeholder="İlçe adı"
                style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
              />
              <SuggestionList
                items={districtSuggestions.map((district) => ({ id: district.id, label: district.name }))}
                onSelect={(id) => {
                  const district = data.districts.find((item) => item.id === id);
                  if (!district) return;
                  setSelectedDistrictId(district.id);
                  setDistrictQuery(district.name);
                }}
                selectedId={selectedDistrictId}
              />
            </Field>
          ) : null}

          <Field label="Kapak Görseli URL">
            <TextInput
              value={coverImage}
              onChangeText={setCoverImage}
              placeholder="https://..."
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <View style={styles.inlineFields}>
            <Field label="Süre (dk)">
              <TextInput
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                keyboardType="number-pad"
                placeholder="200"
                style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
              />
            </Field>
            <Field label="Mesafe (km)">
              <TextInput
                value={distanceKm}
                onChangeText={setDistanceKm}
                keyboardType="decimal-pad"
                placeholder="6.5"
                style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
              />
            </Field>
          </View>

          <Field label="Etiketler" helper="Eklemek için yazıp enter’a bas. Örn. Kahvaltı, Kahve">
            <View style={styles.tagInputRow}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Yeni etiket"
                onSubmitEditing={handleAddTag}
                style={[styles.input, styles.tagInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
              />
              <Pressable onPress={handleAddTag} style={[styles.addTagButton, { backgroundColor: Colors[colorScheme].tint }]}>
                <ThemedText style={styles.addTagLabel} lightColor="#FFFFFF" darkColor="#1D1411">
                  Ekle
                </ThemedText>
              </Pressable>
            </View>
            {tags.length ? (
              <View style={styles.tagList}>
                {tags.map((tag) => (
                  <Pressable key={tag} onPress={() => handleRemoveTag(tag)} style={styles.tagPill}>
                    <ThemedText style={styles.tagPillText}>#{tag} ✕</ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </Field>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Duraklar</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Her durak için isim, tadım notu ve öne çıkan detayı ekle. Harita koordinatları opsiyoneldir.
          </ThemedText>

          <View style={styles.stopList}>
            {stops.map((stop, index) => (
              <StopEditor
                key={stop.localId}
                value={stop}
                onChange={(updates) => handleUpdateStop(index, updates)}
                onRemove={() => handleRemoveStop(index)}
                showRemove={stops.length > 1}
                colorScheme={colorScheme}
              />
            ))}
          </View>

          <Pressable style={styles.addStopButton} onPress={handleAddStop}>
            <ThemedText style={styles.addStopLabel}>+ Durağı Ekle</ThemedText>
          </Pressable>
        </ThemedView>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          </View>
        ) : null}

        {statusMessage ? (
          <View style={styles.successBox}>
            <ThemedText style={styles.successText}>{statusMessage}</ThemedText>
          </View>
        ) : null}

        <Pressable
          style={[styles.submitButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <ThemedText style={styles.submitLabel} lightColor="#FFFFFF" darkColor="#1D1411">
            {isSubmitting ? 'Kaydediliyor…' : 'Rotayı Kaydet'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type RouteStopDraft = ReturnType<typeof createEmptyStop>;

function createEmptyStop(order: number) {
  return {
    localId: `stop-${Date.now()}-${order}`,
    order,
    placeName: '',
    summary: '',
    highlight: '',
    notes: [] as string[],
    dwellMinutes: '',
    latitude: '',
    longitude: '',
    priceLevel: '' as '' | '₺' | '₺₺' | '₺₺₺',
    specialties: [] as string[],
    imageUrl: '',
  };
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      {helper ? <ThemedText style={styles.fieldHelper}>{helper}</ThemedText> : null}
      {children}
    </View>
  );
}

function SuggestionList({
  items,
  onSelect,
  selectedId,
}: {
  items: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  if (!items.length) return null;

  return (
    <View style={styles.suggestionList}>
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.suggestionItem, active ? styles.suggestionItemActive : null]}>
            <ThemedText style={active ? styles.suggestionLabelActive : styles.suggestionLabel}>
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function StopEditor({
  value,
  onChange,
  onRemove,
  showRemove,
  colorScheme,
}: {
  value: RouteStopDraft;
  onChange: (updates: Partial<RouteStopDraft>) => void;
  onRemove: () => void;
  showRemove: boolean;
  colorScheme: 'light' | 'dark';
}) {
  const [noteInput, setNoteInput] = React.useState('');
  const [specialtyInput, setSpecialtyInput] = React.useState('');

  const handleAddNote = () => {
    const clean = noteInput.trim();
    if (!clean) return;
    onChange({ notes: [...value.notes, clean] });
    setNoteInput('');
  };

  const handleRemoveNote = (index: number) => {
    onChange({
      notes: value.notes.filter((_, noteIndex) => noteIndex !== index),
    });
  };

  const handleAddSpecialty = () => {
    const clean = specialtyInput.trim();
    if (!clean) return;
    onChange({ specialties: [...value.specialties, clean] });
    setSpecialtyInput('');
  };

  const handleRemoveSpecialty = (index: number) => {
    onChange({
      specialties: value.specialties.filter((_, specIndex) => specIndex !== index),
    });
  };

  return (
    <View style={styles.stopCard}>
      <View style={styles.stopHeader}>
        <ThemedText style={styles.stopTitle}>Durak {value.order}</ThemedText>
        {showRemove ? (
          <Pressable onPress={onRemove} style={styles.stopRemoveButton}>
            <ThemedText style={styles.stopRemoveLabel}>Kaldır</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        value={value.placeName}
        onChangeText={(text) => onChange({ placeName: text })}
        placeholder="Mekan adı"
        style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
      />

      <TextInput
        value={value.summary}
        onChangeText={(text) => onChange({ summary: text })}
        placeholder="Kısa açıklama"
        style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
      />

      <TextInput
        value={value.highlight}
        onChangeText={(text) => onChange({ highlight: text })}
        placeholder="Duraktaki özel öneri / ipucu"
        style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
      />

      <View style={styles.noteRow}>
        <TextInput
          value={noteInput}
          onChangeText={setNoteInput}
          placeholder="Tadım notu ekle"
          onSubmitEditing={handleAddNote}
          style={[styles.input, styles.noteInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
        />
        <Pressable onPress={handleAddNote} style={styles.noteAddButton}>
          <ThemedText style={styles.noteAddLabel}>+</ThemedText>
        </Pressable>
      </View>
      {value.notes.length ? (
        <View style={styles.noteList}>
          {value.notes.map((note, index) => (
            <Pressable key={note + index} onPress={() => handleRemoveNote(index)} style={styles.noteChip}>
              <ThemedText style={styles.noteChipLabel}>{note} ✕</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.noteRow}>
        <TextInput
          value={specialtyInput}
          onChangeText={setSpecialtyInput}
          placeholder="Spesiyal ekle"
          onSubmitEditing={handleAddSpecialty}
          style={[styles.input, styles.noteInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
        />
        <Pressable onPress={handleAddSpecialty} style={styles.noteAddButton}>
          <ThemedText style={styles.noteAddLabel}>+</ThemedText>
        </Pressable>
      </View>
      {value.specialties.length ? (
        <View style={styles.noteList}>
          {value.specialties.map((spec, index) => (
            <Pressable key={spec + index} onPress={() => handleRemoveSpecialty(index)} style={styles.noteChip}>
              <ThemedText style={styles.noteChipLabel}>{spec} ✕</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.inlineFields}>
        <View style={styles.inlineField}>
          <ThemedText style={styles.fieldLabel}>Süre (dk)</ThemedText>
          <TextInput
            value={value.dwellMinutes}
            onChangeText={(text) => onChange({ dwellMinutes: text })}
            keyboardType='number-pad'
            placeholder="45"
            style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
          />
        </View>
        <View style={styles.inlineField}>
          <ThemedText style={styles.fieldLabel}>Fiyat</ThemedText>
          <TextInput
            value={value.priceLevel}
            onChangeText={(text) => onChange({ priceLevel: text as RouteStopDraft['priceLevel'] })}
            placeholder="₺ / ₺₺ / ₺₺₺"
            style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
          />
        </View>
      </View>

      <View style={styles.inlineFields}>
        <View style={styles.inlineField}>
          <ThemedText style={styles.fieldLabel}>Latitude</ThemedText>
          <TextInput
            value={value.latitude}
            onChangeText={(text) => onChange({ latitude: text })}
            keyboardType="decimal-pad"
            placeholder="41.012"
            style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
          />
        </View>
        <View style={styles.inlineField}>
          <ThemedText style={styles.fieldLabel}>Longitude</ThemedText>
          <TextInput
            value={value.longitude}
            onChangeText={(text) => onChange({ longitude: text })}
            keyboardType="decimal-pad"
            placeholder="29.012"
            style={[styles.input, styles.inlineInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
          />
        </View>
      </View>

      <TextInput
        value={value.imageUrl}
        onChangeText={(text) => onChange({ imageUrl: text })}
        placeholder="Durak görseli URL (opsiyonel)"
        style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
    paddingBottom: 140,
  },
  section: {
    gap: 12,
  },
  sectionDescription: {
    color: '#8C6F60',
    lineHeight: 20,
  },
  banner: {
    borderRadius: 16,
    backgroundColor: '#FFF2E8',
    padding: 16,
    gap: 8,
  },
  bannerTitle: {
    fontWeight: '700',
  },
  bannerCopy: {
    color: '#8C6F60',
    fontSize: 13,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F5CBB0',
    backgroundColor: '#FFF8F0',
    padding: 20,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  fieldHelper: {
    color: '#8C6F60',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  suggestionList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFDCC5',
    overflow: 'hidden',
    marginTop: 8,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionItemActive: {
    backgroundColor: '#FFE5D3',
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#6E5246',
  },
  suggestionLabelActive: {
    fontSize: 14,
    color: '#C65127',
    fontWeight: '700',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
    gap: 6,
  },
  inlineInput: {
    paddingHorizontal: 12,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addTagLabel: {
    fontWeight: '700',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: '#FFDCC5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagPillText: {
    fontWeight: '600',
    fontSize: 12,
  },
  stopList: {
    gap: 16,
  },
  stopCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F7CDB0',
    backgroundColor: '#FFFDF9',
    padding: 16,
    gap: 12,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stopRemoveButton: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFE3D4',
  },
  stopRemoveLabel: {
    color: '#B9482A',
    fontWeight: '600',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteInput: {
    flex: 1,
  },
  noteAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE9DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAddLabel: {
    fontSize: 20,
    color: '#C2552D',
  },
  noteList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteChip: {
    backgroundColor: '#FFDCC5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  noteChipLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  addStopButton: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C2552D',
    paddingVertical: 12,
    alignItems: 'center',
  },
  addStopLabel: {
    color: '#C2552D',
    fontWeight: '600',
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: '#FFD7D7',
    padding: 14,
  },
  errorText: {
    color: '#7A1E1E',
    textAlign: 'center',
  },
  successBox: {
    borderRadius: 16,
    backgroundColor: '#DBF2DE',
    padding: 14,
  },
  successText: {
    color: '#2F7A37',
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  guard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  guardCopy: {
    textAlign: 'center',
    color: '#8C6F60',
    lineHeight: 20,
  },
  guardButton: {
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  guardButtonLabel: {
    fontWeight: '700',
  },
});
