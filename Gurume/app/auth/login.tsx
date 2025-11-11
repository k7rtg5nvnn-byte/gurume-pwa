/**
 * LOGIN SCREEN
 * 
 * Kullanıcı giriş ekranı
 * - Email & Password
 * - Form validation
 * - Error handling
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Giriş Başarısız', result.error?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.title}>
              Gurume
            </ThemedText>
            <ThemedText style={styles.subtitle} numberOfLines={2}>
              Türkiye&apos;nin lezzet rotaları
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="ornek@email.com"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Şifre</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: Colors[colorScheme].primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
                  Giriş Yap
                </ThemedText>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].border }]} />
              <ThemedText style={styles.dividerText}>veya</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].border }]} />
            </View>

            <Pressable
              style={[
                styles.secondaryButton,
                { borderColor: Colors[colorScheme].primary },
              ]}
              onPress={() => router.push('/auth/register')}>
              <ThemedText
                style={styles.secondaryButtonText}
                lightColor={Colors.light.primary}
                darkColor={Colors.dark.primary}>
                Hesap Oluştur
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
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
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
