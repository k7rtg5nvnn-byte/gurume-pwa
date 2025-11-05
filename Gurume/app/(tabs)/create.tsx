import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { mockData } from '@/data/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

const plannerSteps = [
  {
    title: 'Şehir ve ilçe seç',
    description: 'Rotanın odaklanacağı şehirleri belirle; çoklu seçimle kapsamı geniş tut.',
  },
  {
    title: 'Mekanları ekle',
    description:
      'Önerilen yemekleri, hız/temizlik/fiyat-performans skorlarını gir; sırayı sürükleyip bırak.',
  },
  {
    title: 'Rotayı zenginleştir',
    description:
      'Ulaşım modunu, süreyi ve özel notları ekle; topluluk önerileri için fotoğraf yükle.',
  },
  {
    title: 'Yayınla ve puan topla',
    description:
      'Rota yayına alındığında kullanıcılar puanlayıp yorum yapabilsin; vitrin görünürlüğü kazan.',
  },
];

export default function CreateRouteScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const quickPicks = mockData.places.slice(0, 4);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Rota Oluştur</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Toplulukla paylaşılacak lezzet yolculuğunu dakikalar içinde hazırla.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.checklist}>
        <ThemedText type="subtitle">Planlama Adımları</ThemedText>
        <View style={styles.stepList}>
          {plannerSteps.map((step, index) => (
            <View key={step.title} style={styles.stepItem}>
              <View style={[styles.stepIndex, { borderColor: Colors[colorScheme].tint }]}> 
                <ThemedText style={styles.stepIndexText}>{index + 1}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.quickPickSection}>
        <ThemedText type="subtitle">Hızlı Ekle: Topluluk Favorileri</ThemedText>
        <View style={styles.quickPickGrid}>
          {quickPicks.map((place) => (
            <View key={place.id} style={styles.quickPickCard}>
              <ThemedText style={styles.quickPickName}>{place.name}</ThemedText>
              <ThemedText style={styles.quickPickDistrict}>
                {place.specialties.slice(0, 2).join(' • ')}
              </ThemedText>
              <View style={styles.scoreRow}>
                <ScoreBadge label="Hız" value={place.speedScore} />
                <ScoreBadge label="Temizlik" value={place.cleanlinessScore} />
                <ScoreBadge label="Fiyat" value={place.valueScore} />
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.shareSection}>
        <ThemedText type="subtitle">Rotanı Yayına Al</ThemedText>
        <ThemedText style={styles.shareDescription}>
          Çıkardığın rota yayına alınmadan önce moderasyon kontrolünden geçer. Daha hızlı onay için
          fotoğraf, kısa not ve ulaşım tüyoları ekle.
        </ThemedText>
        <Pressable
          style={[styles.publishButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={() => {
            // TODO: integrate with form flow
          }}>
          <ThemedText style={styles.publishButtonLabel} lightColor="#FFFFFF" darkColor="#1D1411">
            Formu Başlat
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreBadge}>
      <ThemedText style={styles.scoreBadgeLabel}>{label}</ThemedText>
      <ThemedText style={styles.scoreBadgeValue}>{value.toFixed(1)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    paddingTop: 24,
    gap: 12,
  },
  headerSubtitle: {
    lineHeight: 22,
  },
  checklist: {
    gap: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFF2E8',
  },
  stepList: {
    gap: 18,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepIndex: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndexText: {
    fontWeight: '700',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    gap: 6,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepDescription: {
    lineHeight: 20,
    color: '#8C6F60',
  },
  quickPickSection: {
    gap: 16,
  },
  quickPickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickPickCard: {
    flexBasis: '48%',
    borderRadius: 18,
    backgroundColor: '#FFE9DB',
    padding: 16,
    gap: 10,
  },
  quickPickName: {
    fontWeight: '600',
  },
  quickPickDistrict: {
    color: '#8C6F60',
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreBadge: {
    backgroundColor: '#FFDCC5',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  scoreBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadgeValue: {
    fontSize: 12,
  },
  shareSection: {
    gap: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFE0C9',
  },
  shareDescription: {
    lineHeight: 20,
  },
  publishButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  publishButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
});
