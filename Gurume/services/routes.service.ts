/**
 * ROUTES SERVICE
 * 
 * Rota CRUD işlemleri
 * - Rota oluşturma
 * - Rota listeleme (puana göre sıralı)
 * - Rota güncelleme
 * - Rota silme
 * - Şehir/ilçe bazlı filtreleme
 */

import { supabase } from '@/lib/supabase';
import type { Route, CreateRouteInput, UpdateRouteInput, ApiResponse, SearchFilters } from '@/types';

class RoutesService {
  /**
   * Tüm rotaları getir (puana göre sıralı)
   */
  async getAllRoutes(filters?: SearchFilters): Promise<Route[]> {
    try {
      let query = supabase
        .from('routes')
        .select(`
          *,
          author:profiles!routes_author_id_fkey(id, username, full_name, avatar_url, is_verified)
        `)
        .eq('is_published', true);

      // Filtreler uygula
      if (filters?.cityIds && filters.cityIds.length > 0) {
        query = query.in('city_id', filters.cityIds);
      }

      if (filters?.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }

      if (filters?.budgetRange && filters.budgetRange.length > 0) {
        query = query.in('budget_range', filters.budgetRange);
      }

      if (filters?.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }

      // Sıralama
      switch (filters?.sortBy) {
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Varsayılan: Puana göre + view count kombinasyonu
          query = query.order('average_rating', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        console.error('getAllRoutes error:', error);
        return [];
      }

      return this.transformRoutes(data || []);
    } catch (error) {
      console.error('getAllRoutes error:', error);
      return [];
    }
  }

  /**
   * Şehir bazlı rotaları getir (TOP RATED)
   */
  async getRoutesByCity(cityId: string, limit: number = 10): Promise<Route[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          author:profiles!routes_author_id_fkey(id, username, full_name, avatar_url, is_verified)
        `)
        .eq('city_id', cityId)
        .eq('is_published', true)
        .order('average_rating', { ascending: false })
        .order('rating_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('getRoutesByCity error:', error);
        return [];
      }

      return this.transformRoutes(data || []);
    } catch (error) {
      console.error('getRoutesByCity error:', error);
      return [];
    }
  }

  /**
   * Tek bir rotayı getir
   */
  async getRouteById(routeId: string): Promise<Route | null> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          author:profiles!routes_author_id_fkey(id, username, full_name, avatar_url, is_verified),
          stops:route_stops(
            *,
            place:places(*)
          )
        `)
        .eq('id', routeId)
        .single();

      if (error || !data) {
        console.error('getRouteById error:', error);
        return null;
      }

      // View count artır
      await this.incrementViewCount(routeId);

      return this.transformRoute(data);
    } catch (error) {
      console.error('getRouteById error:', error);
      return null;
    }
  }

  /**
   * Kullanıcının rotalarını getir
   */
  async getUserRoutes(userId: string): Promise<Route[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          author:profiles!routes_author_id_fkey(id, username, full_name, avatar_url, is_verified)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getUserRoutes error:', error);
        return [];
      }

      return this.transformRoutes(data || []);
    } catch (error) {
      console.error('getUserRoutes error:', error);
      return [];
    }
  }

  /**
   * Yeni rota oluştur
   */
  async createRoute(input: CreateRouteInput, userId: string): Promise<ApiResponse<Route>> {
    try {
      // Rota kaydı oluştur
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert({
          author_id: userId,
          city_id: input.cityId,
          district_ids: input.districtIds,
          title: input.title,
          description: input.description,
          cover_image: input.coverImage,
          images: input.images || [],
          duration_minutes: input.durationMinutes,
          distance_km: input.distanceKm,
          tags: input.tags,
          difficulty: input.difficulty,
          budget_range: input.budgetRange,
          is_published: false, // Moderasyon için bekliyor
          moderation_status: 'pending',
        })
        .select()
        .single();

      if (routeError || !routeData) {
        return {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: 'Rota oluşturulamadı.',
            details: routeError,
          },
        };
      }

      // Durakları ekle
      if (input.stops && input.stops.length > 0) {
        const stops = input.stops.map((stop) => ({
          route_id: routeData.id,
          place_id: stop.placeId,
          stop_order: stop.order,
          tasting_notes: stop.tastingNotes,
          highlight: stop.highlight,
          dwell_minutes: stop.dwellMinutes,
          arrival_time: stop.arrivalTime,
          transport_mode: stop.transportMode,
          notes: stop.notes,
        }));

        const { error: stopsError } = await supabase.from('route_stops').insert(stops);

        if (stopsError) {
          console.error('Stops creation error:', stopsError);
        }
      }

      const route = await this.getRouteById(routeData.id);

      return {
        success: true,
        data: route || undefined,
      };
    } catch (error) {
      console.error('createRoute error:', error);
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
   * Rota güncelle
   */
  async updateRoute(input: UpdateRouteInput): Promise<ApiResponse<Route>> {
    try {
      const updateData: Record<string, unknown> = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.coverImage !== undefined) updateData.cover_image = input.coverImage;
      if (input.images !== undefined) updateData.images = input.images;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
      if (input.budgetRange !== undefined) updateData.budget_range = input.budgetRange;

      const { error } = await supabase
        .from('routes')
        .update(updateData)
        .eq('id', input.id);

      if (error) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Rota güncellenemedi.',
            details: error,
          },
        };
      }

      const route = await this.getRouteById(input.id);

      return {
        success: true,
        data: route || undefined,
      };
    } catch (error) {
      console.error('updateRoute error:', error);
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
   * Rota sil
   */
  async deleteRoute(routeId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('routes').delete().eq('id', routeId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: 'Rota silinemedi.',
            details: error,
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('deleteRoute error:', error);
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
   * View count artır
   */
  private async incrementViewCount(routeId: string): Promise<void> {
    try {
      await supabase.rpc('increment_view_count', { route_id: routeId });
    } catch (error) {
      console.error('incrementViewCount error:', error);
    }
  }

  /**
   * Rota kaydet (favorite)
   */
  async saveRoute(userId: string, routeId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('route_saves')
        .insert({ user_id: userId, route_id: routeId });

      if (error) {
        return {
          success: false,
          error: {
            code: 'SAVE_ERROR',
            message: 'Rota kaydedilemedi.',
          },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Bir hata oluştu.',
        },
      };
    }
  }

  /**
   * Snake_case'den camelCase'e dönüştür
   */
  private transformRoute(data: any): Route {
    return {
      id: data.id,
      authorId: data.author_id,
      author: {
        id: data.author.id,
        username: data.author.username,
        fullName: data.author.full_name,
        avatarUrl: data.author.avatar_url,
        isVerified: data.author.is_verified,
      },
      cityId: data.city_id,
      districtIds: data.district_ids || [],
      title: data.title,
      description: data.description,
      coverImage: data.cover_image,
      images: data.images || [],
      durationMinutes: data.duration_minutes,
      distanceKm: data.distance_km,
      tags: data.tags || [],
      difficulty: data.difficulty,
      budgetRange: data.budget_range,
      bestTimeToVisit: data.best_time_to_visit,
      averageRating: data.average_rating,
      ratingCount: data.rating_count,
      viewCount: data.view_count,
      saveCount: data.save_count,
      shareCount: data.share_count,
      stops: data.stops || [],
      isPublished: data.is_published,
      isVerified: data.is_verified,
      moderationStatus: data.moderation_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publishedAt: data.published_at,
    };
  }

  private transformRoutes(dataArray: any[]): Route[] {
    return dataArray.map((data) => this.transformRoute(data));
  }
}

export const routesService = new RoutesService();
