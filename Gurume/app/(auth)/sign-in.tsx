import React, { useState } from 'react';
import { Image } from 'expo-image';
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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading, profile, isSupabaseReady, sessionUserId } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (sessionUserId && isSupabaseReady) {
      router.replace('/');
    }
  }, [isSupabaseReady, router, sessionUserId]);

  React.useEffect(() => {
    if (!isSupabaseReady && profile) {
      router.replace('/');
    }
  }, [isSupabaseReady, profile, router]);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }

    try {
      await signIn({ email: email.trim(), password });
      router.replace('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Giriş sırasında bir sorun oluştu, tekrar dene.';
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
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.heroImage}
          />
          <View style={styles.header}>
            <ThemedText type="title">Tekrar hoş geldin!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Gurume hesabınla giriş yap; sana özel rotalar, favoriler ve bildirimleri aç.
            </ThemedText>
          </View>

          {Boolean(!isSupabaseReady) ? (
            <View style={styles.banner}>
              <ThemedText style={styles.bannerTitle}>Demo modu aktif</ThemedText>
              <ThemedText style={styles.bannerCopy}>
                Supabase yapılandırması yapılmadığı için tüm özellikler çevrimdışı modda gösteriliyor.
              </ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

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
            <ThemedText style={styles.label}>Şifre</ThemedText>
            <TextInput
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
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
              {isLoading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Hesabın yok mu?</ThemedText>
            <Link href="/sign-up" asChild>
              <Pressable accessibilityRole="button">
                <ThemedText style={[styles.footerLink, { color: Colors[colorScheme].tint }]}>
                  Hemen kayıt ol
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
    paddingBottom: 32,
  },
  heroImage: {
    height: 180,
    width: '100%',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 8,
  },
  subtitle: {
    lineHeight: 20,
    color: '#8C6F60',
  },
  banner: {
    backgroundColor: '#FFF2E8',
    marginHorizontal: 24,
    marginTop: 16,
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
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#7A1E1E',
    textAlign: 'center',
  },
  formGroup: {
    marginTop: 20,
    paddingHorizontal: 24,
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
