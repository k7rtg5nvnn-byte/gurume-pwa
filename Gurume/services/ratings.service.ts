/**
 * RATINGS SERVICE
 * 
 * Rota değerlendirme işlemleri
 * - Rating oluşturma
 * - Rating listeleme
 * - Rating güncelleme
 * - Rating silme
 */

import { supabase } from '@/lib/supabase';
import type { RouteRating, CreateRatingInput, ApiResponse } from '@/types';

class RatingsService {
  /**
   * Rota için tüm rating'leri getir
   */
  async getRatingsByRoute(routeId: string): Promise<RouteRating[]> {
    try {
      const { data, error } = await supabase
        .from('route_ratings')
        .select(`
          *,
          user:profiles!route_ratings_user_id_fkey(id, username, avatar_url, is_verified)
        `)
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getRatingsByRoute error:', error);
        return [];
      }

      return this.transformRatings(data || []);
    } catch (error) {
      console.error('getRatingsByRoute error:', error);
      return [];
    }
  }

  /**
   * Kullanıcının bir rota için rating'ini getir
   */
  async getUserRatingForRoute(userId: string, routeId: string): Promise<RouteRating | null> {
    try {
      const { data, error } = await supabase
        .from('route_ratings')
        .select(`
          *,
          user:profiles!route_ratings_user_id_fkey(id, username, avatar_url, is_verified)
        `)
        .eq('user_id', userId)
        .eq('route_id', routeId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.transformRating(data);
    } catch (error) {
      console.error('getUserRatingForRoute error:', error);
      return null;
    }
  }

  /**
   * Yeni rating oluştur
   */
  async createRating(input: CreateRatingInput, userId: string): Promise<ApiResponse<RouteRating>> {
    try {
      // Daha önce rating vermiş mi kontrol et
      const existing = await this.getUserRatingForRoute(userId, input.routeId);

      if (existing) {
        return {
          success: false,
          error: {
            code: 'ALREADY_RATED',
            message: 'Bu rotayı zaten değerlendirdiniz.',
          },
        };
      }

      const { data, error } = await supabase
        .from('route_ratings')
        .insert({
          route_id: input.routeId,
          user_id: userId,
          score: input.score,
          comment: input.comment,
          images: input.images || [],
          visited_at: input.visitedAt,
        })
        .select(`
          *,
          user:profiles!route_ratings_user_id_fkey(id, username, avatar_url, is_verified)
        `)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: 'Değerlendirme oluşturulamadı.',
            details: error,
          },
        };
      }

      return {
        success: true,
        data: this.transformRating(data),
      };
    } catch (error) {
      console.error('createRating error:', error);
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
   * Rating güncelle
   */
  async updateRating(
    ratingId: string,
    score: number,
    comment: string
  ): Promise<ApiResponse<RouteRating>> {
    try {
      const { data, error } = await supabase
        .from('route_ratings')
        .update({
          score,
          comment,
        })
        .eq('id', ratingId)
        .select(`
          *,
          user:profiles!route_ratings_user_id_fkey(id, username, avatar_url, is_verified)
        `)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Değerlendirme güncellenemedi.',
            details: error,
          },
        };
      }

      return {
        success: true,
        data: this.transformRating(data),
      };
    } catch (error) {
      console.error('updateRating error:', error);
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
   * Rating sil
   */
  async deleteRating(ratingId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('route_ratings').delete().eq('id', ratingId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: 'Değerlendirme silinemedi.',
            details: error,
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('deleteRating error:', error);
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
   * Snake_case'den camelCase'e dönüştür
   */
  private transformRating(data: any): RouteRating {
    return {
      id: data.id,
      routeId: data.route_id,
      userId: data.user_id,
      user: data.user
        ? {
            id: data.user.id,
            username: data.user.username,
            avatarUrl: data.user.avatar_url,
            isVerified: data.user.is_verified,
          }
        : undefined,
      score: data.score,
      comment: data.comment,
      images: data.images || [],
      visitedAt: data.visited_at,
      helpfulCount: data.helpful_count,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private transformRatings(dataArray: any[]): RouteRating[] {
    return dataArray.map((data) => this.transformRating(data));
  }
}

export const ratingsService = new RatingsService();
