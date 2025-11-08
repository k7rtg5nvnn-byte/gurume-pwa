/**
 * AUTHENTICATION SERVICE
 * 
 * Supabase authentication işlemleri
 * - Email/Password signup & login
 * - Phone number support
 * - Username validation
 * - Session management
 */

import { supabase } from '@/lib/supabase';
import type { User, ApiResponse } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  instagramHandle?: string;
  websiteUrl?: string;
}

class AuthService {
  /**
   * Kullanıcı kayıt işlemi
   */
  async signUp(data: SignUpData): Promise<ApiResponse<User>> {
    try {
      // Önce username'in kullanılabilir olduğunu kontrol et
      const usernameAvailable = await this.checkUsernameAvailability(data.username);
      if (!usernameAvailable) {
        return {
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Bu kullanıcı adı kullanımda. Lütfen başka bir tane seçin.',
          },
        };
      }

      // Supabase auth kaydı
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: {
            code: authError.code || 'AUTH_ERROR',
            message: this.getErrorMessage(authError.message),
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            code: 'NO_USER',
            message: 'Kullanıcı oluşturulamadı.',
          },
        };
      }

      // Profile verilerini al
      const profile = await this.getProfile(authData.user.id);

      return {
        success: true,
        data: profile || undefined,
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
          details: error,
        },
      };
    }
  }

  /**
   * Kullanıcı giriş işlemi
   */
  async signIn(data: SignInData): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return {
          success: false,
          error: {
            code: authError.code || 'AUTH_ERROR',
            message: this.getErrorMessage(authError.message),
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            code: 'NO_USER',
            message: 'Kullanıcı bulunamadı.',
          },
        };
      }

      const profile = await this.getProfile(authData.user.id);

      return {
        success: true,
        data: profile || undefined,
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
          details: error,
        },
      };
    }
  }

  /**
   * Kullanıcı çıkış işlemi
   */
  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || 'SIGNOUT_ERROR',
            message: 'Çıkış yapılamadı.',
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu.',
          details: error,
        },
      };
    }
  }

  /**
   * Mevcut kullanıcıyı al
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return await this.getProfile(user.id);
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Profil bilgilerini al
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('getProfile error:', error);
        return null;
      }

      // Snake_case'den camelCase'e dönüştür
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        phoneNumber: data.phone_number,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        instagramHandle: data.instagram_handle,
        websiteUrl: data.website_url,
        isVerified: data.is_verified,
        totalRoutes: data.total_routes,
        totalReviews: data.total_reviews,
        averageRouteRating: data.average_route_rating,
        followerCount: data.follower_count,
        followingCount: data.following_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('getProfile error:', error);
      return null;
    }
  }

  /**
   * Profili güncelle
   */
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      // Username güncelleniyorsa, kullanılabilirlik kontrolü yap
      if (updates.username) {
        const usernameAvailable = await this.checkUsernameAvailability(
          updates.username,
          userId
        );
        if (!usernameAvailable) {
          return {
            success: false,
            error: {
              code: 'USERNAME_TAKEN',
              message: 'Bu kullanıcı adı kullanımda.',
            },
          };
        }
      }

      // Snake_case'e dönüştür
      const updateData: Record<string, unknown> = {};
      if (updates.username !== undefined) updateData.username = updates.username;
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
      if (updates.instagramHandle !== undefined)
        updateData.instagram_handle = updates.instagramHandle;
      if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl;

      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Profil güncellenemedi.',
            details: error,
          },
        };
      }

      const profile = await this.getProfile(userId);

      return {
        success: true,
        data: profile || undefined,
      };
    } catch (error) {
      console.error('updateProfile error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu.',
          details: error,
        },
      };
    }
  }

  /**
   * Username kullanılabilirlik kontrolü
   */
  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase.from('profiles').select('id').eq('username', username);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('checkUsernameAvailability error:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('checkUsernameAvailability error:', error);
      return false;
    }
  }

  /**
   * Şifre sıfırlama emaili gönder
   */
  async sendPasswordResetEmail(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || 'RESET_ERROR',
            message: 'Email gönderilemedi.',
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('sendPasswordResetEmail error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu.',
          details: error,
        },
      };
    }
  }

  /**
   * Hata mesajlarını Türkçeleştir
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Email veya şifre hatalı.',
      'Email not confirmed': 'Lütfen email adresinizi onaylayın.',
      'User already registered': 'Bu email adresi zaten kayıtlı.',
      'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır.',
      'Invalid email': 'Geçersiz email adresi.',
      'Email rate limit exceeded': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
    };

    return errorMessages[error] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

export const authService = new AuthService();
