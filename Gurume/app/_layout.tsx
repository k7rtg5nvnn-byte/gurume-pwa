import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GurumeDataProvider } from '@/contexts/GurumeDataContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export const unstable_settings = {
  initialRouteName: 'welcome/index',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inWelcome = segments[0] === 'welcome';
    const inTabs = segments[0] === '(tabs)';

    // Kullanıcı giriş yapmışsa ve welcome/auth'taysa → tabs'a yönlendir
    if (user && !inTabs) {
      router.replace('/(tabs)');
    }
    // Kullanıcı giriş yapmamışsa ve welcome/auth'ta değilse → welcome'a yönlendir
    else if (!user && !inWelcome && !inAuthGroup) {
      router.replace('/welcome');
    }
  }, [user, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="welcome/index" options={{ headerShown: false, title: 'Hoş Geldiniz' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Gurume' }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, title: 'Giriş Yap' }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false, title: 'Kayıt Ol' }} />
      <Stack.Screen name="route/[id]" options={{ headerShown: true, title: 'Rota Detay', headerBackTitle: 'Geri' }} />
      <Stack.Screen name="city/[id]" options={{ headerShown: true, title: 'Şehir Rotaları', headerBackTitle: 'Geri' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <GurumeDataProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </GurumeDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
