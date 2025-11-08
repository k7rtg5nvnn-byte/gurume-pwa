/**
 * REGISTER SCREEN
 * 
 * Kullanıcı kayıt ekranı
 * - Email, Username, Password, Full Name
 * - Form validation
 * - Error handling
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, username, fullName || undefined);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Başarılı!',
        'Hesabınız oluşturuldu. Lütfen email adresinizi onaylayın.',
        [
          {
            text: 'Tamam',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert('Kayıt Başarısız', result.error?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Hesap Oluştur
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Gurume&apos;ye katıl ve rotalarını paylaş
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Email <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
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
              <ThemedText style={styles.label}>
                Kullanıcı Adı <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="kullanici123"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Ad Soyad</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Adınız Soyadınız"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Şifre <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="En az 6 karakter"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Şifre Tekrar <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].cardBackground,
                    color: Colors[colorScheme].text,
                  },
                ]}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={Colors[colorScheme].textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: Colors[colorScheme].primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
                  Kayıt Ol
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => router.back()}>
              <ThemedText
                style={styles.linkText}
                lightColor={Colors.light.primary}
                darkColor={Colors.dark.primary}>
                Zaten hesabınız var mı? Giriş yapın
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
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  required: {
    color: '#D84727',
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
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
