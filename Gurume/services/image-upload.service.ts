/**
 * IMAGE UPLOAD SERVICE
 * 
 * Supabase Storage kullanarak görsel yükleme
 * - Image picker entegrasyonu
 * - Supabase Storage upload
 * - Thumbnail generation
 * - Dosya boyutu kontrolü
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { UploadImageResult } from '@/types';

interface UploadOptions {
  bucket: 'avatars' | 'route-images' | 'place-images' | 'review-images';
  userId: string;
  maxSizeMB?: number;
  quality?: number;
}

class ImageUploadService {
  /**
   * Galeriden resim seç
   */
  async pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      // İzin kontrolü
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Galeri erişim izni verilmedi');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('pickImage error:', error);
      return null;
    }
  }

  /**
   * Kameradan fotoğraf çek
   */
  async takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Kamera erişim izni verilmedi');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('takePhoto error:', error);
      return null;
    }
  }

  /**
   * Birden fazla resim seç
   */
  async pickMultipleImages(maxCount: number = 5): Promise<ImagePicker.ImagePickerAsset[]> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Galeri erişim izni verilmedi');
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxCount,
        quality: 0.8,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      return result.assets;
    } catch (error) {
      console.error('pickMultipleImages error:', error);
      return [];
    }
  }

  /**
   * Resmi Supabase Storage'a yükle
   */
  async uploadImage(
    imageAsset: ImagePicker.ImagePickerAsset,
    options: UploadOptions
  ): Promise<UploadImageResult> {
    try {
      const { bucket, userId, maxSizeMB = 5, quality = 0.8 } = options;

      // WEB PLATFORMU: fetch ile yükle
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(imageAsset.uri);
          const blob = await response.blob();

          // Dosya boyutu kontrolü
          if (blob.size > maxSizeMB * 1024 * 1024) {
            return {
              success: false,
              error: `Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır.`,
            };
          }

          const fileExt = blob.type.split('/')[1] || 'jpg';
          const fileName = `${userId}_${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, blob, {
              contentType: blob.type,
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            console.error('Upload error (web):', error);
            return {
              success: false,
              error: 'Resim yüklenemedi.',
            };
          }

          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

          return {
            success: true,
            url: urlData.publicUrl,
          };
        } catch (webError) {
          console.error('Web upload error:', webError);
          return {
            success: false,
            error: 'Web platformunda görsel yüklenemedi.',
          };
        }
      }

      // MOBİL PLATFORMLAR: Base64 ile yükle
      // Dosya boyutu kontrolü
      if (imageAsset.fileSize && imageAsset.fileSize > maxSizeMB * 1024 * 1024) {
        return {
          success: false,
          error: `Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır.`,
        };
      }

      // Dosya uzantısını al
      const fileExt = imageAsset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Base64 formatına çevir
      const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
        encoding: 'base64',
      });

      // Supabase'e yükle
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error (mobile):', error);
        return {
          success: false,
          error: 'Resim yüklenemedi.',
        };
      }

      // Public URL al
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('uploadImage error:', error);
      return {
        success: false,
        error: 'Beklenmeyen bir hata oluştu.',
      };
    }
  }

  /**
   * Birden fazla resmi yükle
   */
  async uploadMultipleImages(
    imageAssets: ImagePicker.ImagePickerAsset[],
    options: UploadOptions
  ): Promise<UploadImageResult[]> {
    const uploadPromises = imageAssets.map((asset) => this.uploadImage(asset, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Resmi sil
   */
  async deleteImage(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('deleteImage error:', error);
      return false;
    }
  }

  /**
   * Avatar yükle (özel işlem)
   */
  async uploadAvatar(userId: string): Promise<UploadImageResult> {
    const image = await this.pickImage();

    if (!image) {
      return {
        success: false,
        error: 'Resim seçilmedi.',
      };
    }

    return this.uploadImage(image, {
      bucket: 'avatars',
      userId,
      maxSizeMB: 2,
    });
  }

  /**
   * Rota cover image yükle
   */
  async uploadRouteCoverImage(userId: string): Promise<UploadImageResult> {
    const image = await this.pickImage();

    if (!image) {
      return {
        success: false,
        error: 'Resim seçilmedi.',
      };
    }

    return this.uploadImage(image, {
      bucket: 'route-images',
      userId,
      maxSizeMB: 5,
    });
  }

  /**
   * Rota için birden fazla resim yükle
   */
  async uploadRouteImages(userId: string, maxCount: number = 5): Promise<UploadImageResult[]> {
    const images = await this.pickMultipleImages(maxCount);

    if (images.length === 0) {
      return [];
    }

    return this.uploadMultipleImages(images, {
      bucket: 'route-images',
      userId,
      maxSizeMB: 5,
    });
  }
}

// Helper function to decode base64
function decode(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const imageUploadService = new ImageUploadService();
