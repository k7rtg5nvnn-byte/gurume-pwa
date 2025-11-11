import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GurumeDataProvider } from '@/contexts/GurumeDataContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <GurumeDataProvider>
          <Stack>
            <Stack.Screen name="welcome/index" options={{ headerShown: false, title: 'Hoş Geldiniz' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Gurume' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false, title: 'Giriş Yap' }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false, title: 'Kayıt Ol' }} />
            <Stack.Screen name="route/[id]" options={{ headerShown: true, title: 'Rota Detay', headerBackTitle: 'Geri' }} />
            <Stack.Screen name="city/[id]" options={{ headerShown: true, title: 'Şehir Rotaları', headerBackTitle: 'Geri' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </GurumeDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
