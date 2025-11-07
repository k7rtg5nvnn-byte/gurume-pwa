import { Stack } from 'expo-router';

export default function AuthStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF3E4',
        },
        headerTintColor: '#C65127',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}>
      <Stack.Screen name="sign-in" options={{ title: 'Gurume\'ye Giriş' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Hesap Oluştur' }} />
    </Stack>
  );
}
