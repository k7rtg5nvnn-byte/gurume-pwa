/**
 * PROFİL EKRANI
 * 
 * - Kullanıcı bilgileri
 * - Profil düzenleme
 * - Avatar upload
 * - Kullanıcının rotaları
 * - İstatistikler
 * - Çıkış
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
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { imageUploadService } from '@/services/image-upload.service';
import { routesService } from '@/services/routes.service';
import type { Route } from '@/types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRoutes, setUserRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [instagramHandle, setInstagramHandle] = useState(user?.instagramHandle || '');

  useEffect(() => {
    if (user) {
      loadUserRoutes();
    } else {
      router.replace('/auth/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserRoutes = async () => {
    if (!user) return;

    try {
      const routes = await routesService.getUserRoutes(user.id);
      setUserRoutes(routes);
    } catch (error) {
      console.error('loadUserRoutes error:', error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!user) return;

    setLoading(true);
    const result = await imageUploadService.uploadAvatar(user.id);
    setLoading(false);

    if (result.success && result.url) {
      const updateResult = await updateProfile({ avatarUrl: result.url });
      if (updateResult.success) {
        Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
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
      Alert.alert('Başarılı', 'Profil güncellendi.');
      setEditing(false);
    } else {
      Alert.alert('Hata', result.error?.message || 'Profil güncellenemedi.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar & Basic Info */}
      <ThemedView style={styles.header}>
        <Pressable onPress={handleUploadAvatar} disabled={loading}>
          <View style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: Colors[colorScheme].border }]}>
                <ThemedText style={styles.avatarPlaceholderText}>
                  {user.username[0].toUpperCase()}
                </ThemedText>
              </View>
            )}
            {loading && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>
        </Pressable>

        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <ThemedText type="title" style={styles.username}>
              @{user.username}
            </ThemedText>
            {user.isVerified && <ThemedText style={styles.verifiedBadge}>✓</ThemedText>}
          </View>
          {user.fullName && <ThemedText style={styles.fullName}>{user.fullName}</ThemedText>}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Rotalar" value={user.totalRoutes} colorScheme={colorScheme} />
          <StatCard label="Değerlendirme" value={user.totalReviews} colorScheme={colorScheme} />
          <StatCard
            label="Puan Ort."
            value={user.averageRouteRating.toFixed(1)}
            colorScheme={colorScheme}
          />
        </View>
      </ThemedView>

      {/* Edit Profile */}
      {editing ? (
        <ThemedView style={[styles.editSection, { borderColor: Colors[colorScheme].border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profili Düzenle
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Ad Soyad</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].cardBackground,
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={Colors[colorScheme].textLight}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Bio</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].cardBackground,
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor={Colors[colorScheme].textLight}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Instagram</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].cardBackground,
                  color: Colors[colorScheme].text,
                },
              ]}
              placeholder="@kullaniciadi"
              placeholderTextColor={Colors[colorScheme].textLight}
              value={instagramHandle}
              onChangeText={setInstagramHandle}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.editActions}>
            <Pressable
              style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={handleSaveProfile}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText} lightColor="#FFFFFF">
                  Kaydet
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: Colors[colorScheme].border }]}
              onPress={() => setEditing(false)}>
              <ThemedText style={styles.secondaryButtonText}>İptal</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ) : (
        <>
          {/* Bio */}
          {user.bio && (
            <ThemedView style={styles.bioSection}>
              <ThemedText style={styles.bioText}>{user.bio}</ThemedText>
            </ThemedView>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={() => setEditing(true)}>
              <ThemedText style={styles.actionButtonText} lightColor="#FFFFFF">
                Profili Düzenle
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: Colors[colorScheme].secondary },
              ]}
              onPress={handleSignOut}>
              <ThemedText style={styles.actionButtonText} lightColor="#FFFFFF">
                Çıkış Yap
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}

      {/* User Routes */}
      <ThemedView style={styles.routesSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Rotalarım ({userRoutes.length})
        </ThemedText>

        {loadingRoutes ? (
          <ActivityIndicator color={Colors[colorScheme].primary} style={{ marginTop: 16 }} />
        ) : userRoutes.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Henüz rota oluşturmadınız.</ThemedText>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={() => router.push('/(tabs)/create')}>
              <ThemedText style={styles.emptyButtonText} lightColor="#FFFFFF">
                İlk Rotanı Oluştur
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <View style={styles.routesList}>
            {userRoutes.map((route) => (
              <Pressable
                key={route.id}
                style={[styles.routeItem, { borderColor: Colors[colorScheme].border }]}
                onPress={() => router.push(`/route/${route.id}`)}>
                <Image source={{ uri: route.coverImage }} style={styles.routeItemImage} />
                <View style={styles.routeItemContent}>
                  <ThemedText style={styles.routeItemTitle} numberOfLines={1}>
                    {route.title}
                  </ThemedText>
                  <ThemedText style={styles.routeItemMeta}>
                    ⭐ {route.averageRating.toFixed(1)} • {route.ratingCount} değerlendirme
                  </ThemedText>
                  <ThemedText style={styles.routeItemStatus}>
                    {route.isPublished ? '✓ Yayında' : '⏳ Moderasyonda'}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  colorScheme,
}: {
  label: string;
  value: number | string;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: Colors[colorScheme].badgeOrange }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 24,
  },
  verifiedBadge: {
    fontSize: 20,
    color: '#4CAF50',
  },
  fullName: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bioSection: {
    paddingHorizontal: 20,
  },
  bioText: {
    lineHeight: 22,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  editSection: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  routesSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  routesList: {
    gap: 12,
  },
  routeItem: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 12,
    padding: 12,
  },
  routeItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  routeItemContent: {
    flex: 1,
    gap: 4,
  },
  routeItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeItemMeta: {
    fontSize: 13,
  },
  routeItemStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
