import { SplashScreen } from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * App Loading Component
 * Shows a loading screen while the app is initializing.
 * 
 * Purpose: Provides visual feedback during app startup,
 * preventing blank screens and improving user experience.
 */

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface AppLoadingProps {
  error?: Error;
  onRetry?: () => void;
}

export function AppLoading({ error, onRetry }: AppLoadingProps) {
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    // Hide splash screen when this component mounts
    // This ensures smooth transition from splash to loading screen
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.errorTitle}>
            Yükleme Hatası
          </ThemedText>
          <ThemedText style={styles.errorMessage}>
            Uygulama yüklenirken bir hata oluştu.
          </ThemedText>
          {__DEV__ && (
            <View style={styles.errorDetails}>
              <ThemedText style={styles.errorText}>{error.message}</ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText style={styles.loadingText}>Gurume yükleniyor...</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  errorDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFE0E0',
    borderRadius: 12,
    maxWidth: 400,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#CC0000',
  },
});
