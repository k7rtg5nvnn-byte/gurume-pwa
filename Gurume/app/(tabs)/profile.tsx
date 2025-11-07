import React from 'react';
import { ScrollView, StyleSheet, TextInput, View, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGurumeData } from '@/hooks/use-gurume-data';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { profile, updateProfile, signOut, isSupabaseReady, isLoading } = useAuth();
  const { data } = useGurumeData();

  const [fullName, setFullName] = React.useState(profile?.fullName ?? '');
  const [phone, setPhone] = React.useState(profile?.phone ?? '');
  const [bio, setBio] = React.useState(profile?.bio ?? '');
  const [cityQuery, setCityQuery] = React.useState('');
  const [districtQuery, setDistrictQuery] = React.useState('');
  const [selectedCityId, setSelectedCityId] = React.useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setPhone(profile.phone ?? '');
    setBio(profile.bio ?? '');

    if (profile.cityCode) {
      const city = data.cities.find((item) => item.code === profile.cityCode);
      if (city) {
        setSelectedCityId(city.id);
        setCityQuery(city.name);
      }
    }

    if (profile.districtCode) {
      const district = data.districts.find((item) => item.code === profile.districtCode);
      if (district) {
        setSelectedDistrictId(district.id);
        setDistrictQuery(district.name);
      }
    }
  }, [data.cities, data.districts, profile]);

  const citySuggestions = React.useMemo(() => {
    if (!cityQuery.trim()) {
      return data.cities.slice(0, 6);
    }
    const lowered = cityQuery.trim().toLowerCase();
    return data.cities
      .filter((city) => city.name.toLowerCase().includes(lowered))
      .slice(0, 6);
  }, [cityQuery, data.cities]);

  const districtSuggestions = React.useMemo(() => {
    if (!selectedCityId) return [];
    const districts = data.districts.filter((district) => district.cityId === selectedCityId);
    if (!districtQuery.trim()) {
      return districts.slice(0, 6);
    }
    const lowered = districtQuery.trim().toLowerCase();
    return districts.filter((district) => district.name.toLowerCase().includes(lowered)).slice(0, 6);
  }, [data.districts, districtQuery, selectedCityId]);

  const handleSave = async () => {
    setStatusMessage(null);
    await updateProfile({
      fullName,
      phone,
      bio,
      cityCode: selectedCityId ? data.cities.find((city) => city.id === selectedCityId)?.code ?? null : null,
      districtCode: selectedDistrictId
        ? data.districts.find((district) => district.id === selectedDistrictId)?.code ?? null
        : null,
    });
    setStatusMessage('Profil bilgileriniz güncellendi.');
  };

  if (!profile) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText type="title">Profili görmek için giriş yap</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Kayıt olduğunuzda favorileriniz, rotalarınız ve bildirim ayarlarınız burada görünecek.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="title">Profilim</ThemedText>
        <ThemedText style={styles.helperText}>
          Bilgilerini güncellediğinde sana özel rota önerileri daha isabetli olur.
        </ThemedText>

        <View style={styles.section}>
          <Field label="Ad Soyad">
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Adını ve soyadını yaz"
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="E-posta" helper="Hesap doğrulaması için kullanılır" readOnly>
            <TextInput
              value={profile.email}
              editable={false}
              style={[styles.input, styles.disabledInput, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="Telefon">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+90 5xx xxx xx xx"
              keyboardType="phone-pad"
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="Biyografi" helper="Kısa kendini tanıt; topluluk seni tanısın.">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Yerel lezzet tutkunu, gezgin gurme..."
              multiline
              numberOfLines={4}
              style={[styles.input, styles.multiline, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </Field>

          <Field label="Şehir">
            <TextInput
              value={cityQuery}
              onChangeText={(text) => {
                setCityQuery(text);
                setSelectedCityId(null);
                setSelectedDistrictId(null);
                setDistrictQuery('');
              }}
              placeholder="Örn. İstanbul"
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
            <SuggestionList
              items={citySuggestions.map((city) => ({
                id: city.id,
                label: city.name,
              }))}
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
                placeholder="Örn. Kadıköy"
                style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
              />
              <SuggestionList
                items={districtSuggestions.map((district) => ({
                  id: district.id,
                  label: district.name,
                }))}
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
        </View>

        {statusMessage ? <ThemedText style={styles.statusText}>{statusMessage}</ThemedText> : null}

        <Pressable
          onPress={handleSave}
          style={[
            styles.primaryButton,
            { backgroundColor: Colors[colorScheme].tint },
          ]}>
          <ThemedText style={styles.primaryButtonLabel} lightColor="#FFFFFF" darkColor="#1D1411">
            Kaydet
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Hesap</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Supabase</ThemedText>
          <ThemedText style={styles.infoValue}>
            {isSupabaseReady ? 'Bağlı' : 'Demo Modu'}
          </ThemedText>
        </View>
        <Pressable onPress={signOut} style={styles.secondaryButton} disabled={isLoading}>
          <ThemedText style={styles.secondaryButtonLabel}>
            {isLoading ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

function Field({
  label,
  helper,
  children,
  readOnly = false,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
        {readOnly ? <ThemedText style={styles.readonlyBadge}>Salt okunur</ThemedText> : null}
      </View>
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
        const isSelected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            style={[styles.suggestionItem, isSelected ? styles.suggestionItemActive : null]}
            onPress={() => onSelect(item.id)}>
            <ThemedText style={isSelected ? styles.suggestionLabelActive : styles.suggestionLabel}>
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F5CBB0',
    backgroundColor: '#FFF8F0',
    padding: 20,
    gap: 16,
  },
  helperText: {
    color: '#8C6F60',
    lineHeight: 20,
  },
  section: {
    gap: 18,
  },
  field: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  fieldHelper: {
    fontSize: 12,
    color: '#8C6F60',
  },
  readonlyBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFE0C9',
    color: '#C65127',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    opacity: 0.6,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  suggestionList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FAD6C0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionItemActive: {
    backgroundColor: '#FFE9DB',
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#6E5246',
  },
  suggestionLabelActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C65127',
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    color: '#2F7A37',
    backgroundColor: '#DBF2DE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#8C6F60',
  },
  infoValue: {
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C2552D',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: '#C2552D',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#8C6F60',
  },
});
