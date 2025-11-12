/**
 * PROFİL EKRANI - MODERN TASARIM
 * 
 * ✨ Özellikler:
 * - Stats & Achievements
 * - Badge system
 * - Activity feed
 * - Modern avatar edit
 * - Quick actions
 * - Kullanıcı rotaları
 */

import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { imageUploadService } from '@/services/image-upload.service';
import { routesService } from '@/services/routes.service';
import type { Route } from '@/types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user, signOut, updateProfile, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRoutes, setUserRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [instagramHandle, setInstagramHandle] = useState(user?.instagramHandle || '');

  // Stats
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalReviews: 0,
    totalLikes: 0,
    avgRating: 0,
    totalViews: 0,
    followerCount: 0,
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'İlk Rota', description: 'İlk rotanı oluştur', icon: '🎉', unlocked: false, progress: 0, total: 1 },
    { id: '2', title: 'Keşif Tutkunu', description: '10 rota oluştur', icon: '🗺️', unlocked: false, progress: 0, total: 10 },
    { id: '3', title: 'Lezzet Rehberi', description: '25 rota oluştur', icon: '⭐', unlocked: false, progress: 0, total: 25 },
    { id: '4', title: 'Sosyal Kelebek', description: '100 beğeni topla', icon: '❤️', unlocked: false, progress: 0, total: 100 },
    { id: '5', title: 'Gezgin', description: '5 farklı şehirde rota', icon: '✈️', unlocked: false, progress: 0, total: 5 },
  ]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      router.replace('/auth/login');
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoadingRoutes(true);
      
      // Kullanıcının rotalarını yükle
      const routes = await routesService.getUserRoutes(user.id);
      setUserRoutes(routes);
      
      // Stats hesapla
      const totalViews = routes.reduce((sum, r) => sum + r.viewCount, 0);
      const totalLikes = routes.reduce((sum, r) => sum + r.saveCount, 0);
      const avgRating = routes.length > 0 
        ? routes.reduce((sum, r) => sum + r.averageRating, 0) / routes.length 
        : 0;
      
      setStats({
        totalRoutes: routes.length,
        totalReviews: user.totalReviews || 0,
        totalLikes,
        avgRating,
        totalViews,
        followerCount: 0, // TODO: Implement followers
      });
      
      // Achievements güncelle
      const updatedAchievements = [...achievements];
      updatedAchievements[0].progress = Math.min(routes.length, 1);
      updatedAchievements[0].unlocked = routes.length >= 1;
      updatedAchievements[1].progress = Math.min(routes.length, 10);
      updatedAchievements[1].unlocked = routes.length >= 10;
      updatedAchievements[2].progress = Math.min(routes.length, 25);
      updatedAchievements[2].unlocked = routes.length >= 25;
      updatedAchievements[3].progress = Math.min(totalLikes, 100);
      updatedAchievements[3].unlocked = totalLikes >= 100;
      
      const uniqueCities = new Set(routes.map(r => r.cityId));
      updatedAchievements[4].progress = Math.min(uniqueCities.size, 5);
      updatedAchievements[4].unlocked = uniqueCities.size >= 5;
      
      setAchievements(updatedAchievements);
      
    } catch (error) {
      console.error('loadData error:', error);
    } finally {
      setLoadingRoutes(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refreshUser();
    loadData();
  };

  const handleUploadAvatar = async () => {
    if (!user) return;

    setLoading(true);
    const result = await imageUploadService.uploadAvatar(user.id);
    setLoading(false);

    if (result.success && result.url) {
      const updateResult = await updateProfile({ avatarUrl: result.url });
      if (updateResult.success) {
        Alert.alert('Başarılı! ✨', 'Profil fotoğrafın güncellendi.');
      }
    } else {
      Alert.alert('Hata', result.error || 'Fotoğraf yüklenemedi.');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    const result = await updateProfile({
      fullName: fullName || undefined,
      bio: bio || undefined,
      instagramHandle: instagramHandle || undefined,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Başarılı! ✅', 'Profilin güncellendi.');
      setEditing(false);
    } else {
      Alert.alert('Hata', result.error?.message || 'Güncelleme başarısız.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors[colorScheme].primary, Colors[colorScheme].secondary]}
          style={styles.header}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handleUploadAvatar} disabled={loading}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ 
                    uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&size=200` 
                  }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.avatarEditBadge}>
                  <ThemedText style={styles.avatarEditIcon} lightColor="#FFFFFF" darkColor="#FFFFFF">
                    📷
                  </ThemedText>
                </View>
                {loading && (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Pressable>

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {user.fullName || user.username}
                {user.isVerified && ' ✓'}
              </ThemedText>
              <ThemedText style={styles.userHandle} lightColor="#FFFFFF" darkColor="#FFFFFF">
                @{user.username}
              </ThemedText>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <ThemedText style={styles.quickStatValue} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {stats.totalRoutes}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                Rota
              </ThemedText>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <ThemedText style={styles.quickStatValue} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {stats.totalViews}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                Görüntülenme
              </ThemedText>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <ThemedText style={styles.quickStatValue} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {stats.avgRating.toFixed(1)}⭐
              </ThemedText>
              <ThemedText style={styles.quickStatLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
                Ortalama
              </ThemedText>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Bio Section */}
          {!editing && user.bio && (
            <View style={[styles.bioCard, { 
              backgroundColor: Colors[colorScheme].cardBackground,
              borderColor: Colors[colorScheme].border 
            }]}>
              <ThemedText style={styles.bioText}>{user.bio}</ThemedText>
            </View>
          )}

          {/* Edit Form */}
          {editing && (
            <View style={[styles.editCard, { 
              backgroundColor: Colors[colorScheme].cardBackground,
              borderColor: Colors[colorScheme].border 
            }]}>
              <ThemedText style={styles.editTitle}>Profili Düzenle</ThemedText>
              
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>Ad Soyad</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].background,
                    color: Colors[colorScheme].text 
                  }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ad Soyad"
                  placeholderTextColor={Colors[colorScheme].textSecondary}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>Bio</ThemedText>
                <TextInput
                  style={[styles.textarea, { 
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].background,
                    color: Colors[colorScheme].text 
                  }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Kendini tanıt..."
                  placeholderTextColor={Colors[colorScheme].textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>Instagram</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].background,
                    color: Colors[colorScheme].text 
                  }]}
                  value={instagramHandle}
                  onChangeText={setInstagramHandle}
                  placeholder="@kullaniciadi"
                  placeholderTextColor={Colors[colorScheme].textSecondary}
                />
              </View>

              <View style={styles.editActions}>
                <Pressable
                  style={[styles.buttonSecondary, { borderColor: Colors[colorScheme].border }]}
                  onPress={() => {
                    setEditing(false);
                    setFullName(user.fullName || '');
                    setBio(user.bio || '');
                    setInstagramHandle(user.instagramHandle || '');
                  }}>
                  <ThemedText style={styles.buttonSecondaryText}>İptal</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
                  onPress={handleSaveProfile}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
                      Kaydet
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          {!editing && (
            <View style={styles.actionsGrid}>
              <Pressable
                style={[styles.actionCard, { 
                  backgroundColor: Colors[colorScheme].cardBackground,
                  borderColor: Colors[colorScheme].border 
                }]}
                onPress={() => setEditing(true)}>
                <ThemedText style={styles.actionIcon}>✏️</ThemedText>
                <ThemedText style={styles.actionText}>Düzenle</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionCard, { 
                  backgroundColor: Colors[colorScheme].cardBackground,
                  borderColor: Colors[colorScheme].border 
                }]}
                onPress={() => router.push('/(tabs)/create')}>
                <ThemedText style={styles.actionIcon}>➕</ThemedText>
                <ThemedText style={styles.actionText}>Rota Oluştur</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.actionCard, { 
                  backgroundColor: Colors[colorScheme].cardBackground,
                  borderColor: Colors[colorScheme].border 
                }]}
                onPress={handleSignOut}>
                <ThemedText style={styles.actionIcon}>🚪</ThemedText>
                <ThemedText style={styles.actionText}>Çıkış</ThemedText>
              </Pressable>
            </View>
          )}

          {/* Achievements */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🏆 Başarılar</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[styles.achievementCard, { 
                    backgroundColor: Colors[colorScheme].cardBackground,
                    borderColor: Colors[colorScheme].border,
                    opacity: achievement.unlocked ? 1 : 0.5 
                  }]}>
                  <ThemedText style={styles.achievementIcon}>
                    {achievement.icon}
                  </ThemedText>
                  <ThemedText style={styles.achievementTitle} numberOfLines={1}>
                    {achievement.title}
                  </ThemedText>
                  {achievement.total && (
                    <ThemedText style={styles.achievementProgress}>
                      {achievement.progress}/{achievement.total}
                    </ThemedText>
                  )}
                  {achievement.unlocked && (
                    <View style={[styles.achievementBadge, { backgroundColor: Colors[colorScheme].primary }]}>
                      <ThemedText style={styles.achievementBadgeText} lightColor="#FFFFFF" darkColor="#1D1411">
                        ✓
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* User Routes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>📍 Rotalarım</ThemedText>
              <ThemedText style={styles.sectionCount}>({userRoutes.length})</ThemedText>
            </View>

            {loadingRoutes ? (
              <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
            ) : userRoutes.length === 0 ? (
              <View style={styles.emptyRoutes}>
                <ThemedText style={styles.emptyRoutesEmoji}>🗺️</ThemedText>
                <ThemedText style={styles.emptyRoutesText}>
                  Henüz rota oluşturmadın
                </ThemedText>
                <Pressable
                  style={[styles.button, { 
                    backgroundColor: Colors[colorScheme].primary,
                    marginTop: 16 
                  }]}
                  onPress={() => router.push('/(tabs)/create')}>
                  <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#1D1411">
                    İlk Rotanı Oluştur
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              userRoutes.map((route) => (
                <Pressable
                  key={route.id}
                  style={[styles.routeCard, { 
                    backgroundColor: Colors[colorScheme].cardBackground,
                    borderColor: Colors[colorScheme].border 
                  }]}
                  onPress={() => router.push(`/route/${route.id}`)}>
                  <Image
                    source={{ uri: route.coverImage }}
                    style={styles.routeImage}
                    contentFit="cover"
                  />
                  <View style={styles.routeContent}>
                    <ThemedText style={styles.routeTitle} numberOfLines={1}>
                      {route.title}
                    </ThemedText>
                    <View style={styles.routeStats}>
                      <ThemedText style={styles.routeStat}>⭐ {route.averageRating.toFixed(1)}</ThemedText>
                      <ThemedText style={styles.routeStat}>👁️ {route.viewCount}</ThemedText>
                      <ThemedText style={styles.routeStat}>💬 {route.reviewCount}</ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    opacity: 0.9,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    padding: 20,
  },
  bioCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionCount: {
    fontSize: 16,
    opacity: 0.6,
    marginLeft: 8,
  },
  achievementCard: {
    width: 120,
    height: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementProgress: {
    fontSize: 11,
    opacity: 0.6,
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  routeImage: {
    width: 100,
    height: 100,
  },
  routeContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  routeStat: {
    fontSize: 13,
    opacity: 0.7,
  },
  emptyRoutes: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyRoutesEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyRoutesText: {
    fontSize: 16,
    opacity: 0.6,
  },
  editCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
