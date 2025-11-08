import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/error-boundary';
import { GurumeDataProvider } from '@/contexts/GurumeDataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Root Layout Component
 * 
 * This is the main entry point for the app's navigation structure.
 * It wraps the entire app with:
 * - Theme Provider: Handles light/dark mode
 * - Error Boundary: Catches and handles errors gracefully
 * - Data Provider: Provides app data to all child components
 * 
 * Purpose: Ensures the app has proper error handling, theming,
 * and data management from the root level.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <GurumeDataProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="city/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="route/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </GurumeDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
