import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
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

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { signUp, isLoading, isSupabaseReady } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!fullName || !email || !password) {
      setError('Ad-soyad, e-posta ve şifre zorunludur.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    try {
      await signUp({
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        fullName: fullName.trim(),
      });

      setSuccessMessage(
        'Hesabın oluşturuldu! E-postanı kontrol edip doğrulama yaptıktan sonra giriş yapabilirsin.',
      );
      setTimeout(() => {
        router.replace('/sign-in');
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Kayıt sırasında bir sorun oluştu, tekrar dene.';
      setError(message);
    }
  };

  const disabled = isLoading || !isSupabaseReady;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.card}>
          <View style={styles.header}>
            <ThemedText type="title">Gurume ailesine katıl</ThemedText>
            <ThemedText style={styles.subtitle}>
              Favori rotalarını kaydet, yeni rotalar paylaş ve bulunduğun konuma özel öneriler al.
            </ThemedText>
          </View>

          {Boolean(!isSupabaseReady) ? (
            <View style={styles.banner}>
              <ThemedText style={styles.bannerTitle}>Demo modu aktif</ThemedText>
              <ThemedText style={styles.bannerCopy}>
                Supabase yapılandırması yapılmadığı için kayıt formu yalnızca örnek amacıyla
                gösteriliyor.
              </ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <ThemedText style={styles.successText}>{successMessage}</ThemedText>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Ad Soyad</ThemedText>
            <TextInput
              placeholder="Adını ve soyadını gir"
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>E-posta</ThemedText>
            <TextInput
              placeholder="ornek@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Telefon</ThemedText>
            <TextInput
              placeholder="+90 5xx xxx xx xx"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Şifre</ThemedText>
            <TextInput
              placeholder="En az 8 karakter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Şifre (Tekrar)</ThemedText>
            <TextInput
              placeholder="Şifreni tekrar gir"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[styles.input, { borderColor: Colors[colorScheme].tabIconDefault }]}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={disabled}
            style={[
              styles.submitButton,
              {
                backgroundColor: disabled
                  ? '#F5CBB0'
                  : Colors[colorScheme].tint,
              },
            ]}>
            <ThemedText
              style={styles.submitLabel}
              lightColor="#FFFFFF"
              darkColor={disabled ? '#C6977D' : '#1D1411'}>
              {isLoading ? 'Gönderiliyor…' : 'Kayıt Ol'}
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Zaten hesabın var mı?</ThemedText>
            <Link href="/sign-in" asChild>
              <Pressable accessibilityRole="button">
                <ThemedText style={[styles.footerLink, { color: Colors[colorScheme].tint }]}>
                  Giriş yap
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#F5CBB0',
    paddingVertical: 32,
    gap: 12,
  },
  header: {
    paddingHorizontal: 24,
    gap: 8,
  },
  subtitle: {
    lineHeight: 20,
    color: '#8C6F60',
  },
  banner: {
    backgroundColor: '#FFF2E8',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  bannerTitle: {
    fontWeight: '700',
  },
  bannerCopy: {
    fontSize: 14,
    lineHeight: 18,
    color: '#8C6F60',
  },
  errorBox: {
    backgroundColor: '#FFD6D6',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#7A1E1E',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#E2F7D9',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    color: '#235229',
    textAlign: 'center',
  },
  formGroup: {
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#8C6F60',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
