/**
 * WELCOME / ONBOARDING EKRANI
 * 
 * İlk açılışta kullanıcıyı karşılayan tanıtım ekranı
 */

import React, { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Lezzet Rotalarını Keşfet',
    description: 'Türkiye\'nin dört bir yanından gurmelerin önerdiği en iyi yeme-içme rotalarını keşfet.',
    emoji: '🗺️',
  },
  {
    id: '2',
    title: 'Kendi Rotanı Oluştur',
    description: 'Favori mekanlarınızı birleştirerek kendi lezzet rotalarınızı oluşturun ve paylaşın.',
    emoji: '✨',
  },
  {
    id: '3',
    title: 'Topluluğa Katıl',
    description: 'Binlerce gurme ile deneyimlerini paylaş, rotaları değerlendir ve en iyileri keşfet.',
    emoji: '🤝',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/login');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/login');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
      </View>
      <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.slideDescription}>{item.description}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <ThemedText type="title" style={styles.appName}>
          Gurume
        </ThemedText>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
              { backgroundColor: index === currentIndex ? Colors[colorScheme].primary : Colors[colorScheme].border },
            ]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {currentIndex < slides.length - 1 ? (
          <>
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <ThemedText style={styles.skipText}>Geç</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: Colors[colorScheme].primary }]}>
              <ThemedText style={styles.nextText} lightColor="#FFFFFF" darkColor="#1D1411">
                İleri
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={handleNext}
            style={[styles.getStartedButton, { backgroundColor: Colors[colorScheme].primary }]}>
            <ThemedText style={styles.getStartedText} lightColor="#FFFFFF" darkColor="#1D1411">
              Hadi Başlayalım! 🚀
            </ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  slide: {
    width,
    paddingHorizontal: 40,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    overflow: 'visible',
  },
  emoji: {
    fontSize: 70,
    textAlign: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
  },
  getStartedButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
