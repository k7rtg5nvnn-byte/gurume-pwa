import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title">Sayfa bulunamadı</ThemedText>
        <ThemedText style={styles.subtitle}>
          Aradığın rota ya silindi ya da henüz yayında değil. Ana sayfaya dönerek keşfetmeye devam edebilirsin.
        </ThemedText>
        <Link href="/" asChild>
          <Pressable style={styles.actionButton}>
            <ThemedText style={styles.actionLabel} lightColor="#FFFFFF" darkColor="#1D1411">
              Ana sayfaya dön
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    gap: 16,
  },
  subtitle: {
    lineHeight: 20,
    color: '#8C6F60',
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#FF6B2C',
  },
  actionLabel: {
    fontWeight: '700',
  },
});
