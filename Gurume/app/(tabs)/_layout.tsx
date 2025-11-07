import { Tabs, useRouter, useSegments } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { sessionUserId, isSupabaseReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthStack = segments[0] === '(auth)';

    if (isSupabaseReady && !sessionUserId && !inAuthStack) {
      router.replace('/sign-in');
    } else if (sessionUserId && inAuthStack) {
      router.replace('/');
    }
  }, [isSupabaseReady, router, segments, sessionUserId]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
            title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
            title: 'Keşfet',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Rota Oluştur',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favoriler',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
          }}
        />
    </Tabs>
  );
}
