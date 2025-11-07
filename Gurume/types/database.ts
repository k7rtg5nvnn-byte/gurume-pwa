export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          full_name: string | null;
          phone: string | null;
          bio: string | null;
          avatar_url: string | null;
          city_code: string | null;
          district_code: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          full_name?: string | null;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          city_code?: string | null;
          district_code?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          full_name?: string | null;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          city_code?: string | null;
          district_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      routes: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          user_id: string;
          title: string;
          summary: string | null;
          description: string | null;
          city_code: string;
          city_name: string;
          district_code: string | null;
          district_name: string | null;
          cover_image_url: string | null;
          duration_minutes: number | null;
          distance_km: number | null;
          tags: string[] | null;
          average_rating: number | null;
          rating_count: number | null;
          is_published: boolean;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id: string;
          title: string;
          summary?: string | null;
          description?: string | null;
          city_code: string;
          city_name: string;
          district_code?: string | null;
          district_name?: string | null;
          cover_image_url?: string | null;
          duration_minutes?: number | null;
          distance_km?: number | null;
          tags?: string[] | null;
          average_rating?: number | null;
          rating_count?: number | null;
          is_published?: boolean;
          is_featured?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string;
          title?: string;
          summary?: string | null;
          description?: string | null;
          city_code?: string;
          city_name?: string;
          district_code?: string | null;
          district_name?: string | null;
          cover_image_url?: string | null;
          duration_minutes?: number | null;
          distance_km?: number | null;
          tags?: string[] | null;
          average_rating?: number | null;
          rating_count?: number | null;
          is_published?: boolean;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'routes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      route_stops: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          route_id: string;
          order_index: number;
          place_id: string | null;
          place_name: string;
          summary: string | null;
          highlight: string | null;
          tasting_notes: string[] | null;
          dwell_minutes: number | null;
          latitude: number | null;
          longitude: number | null;
          price_level: string | null;
          specialties: string[] | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          route_id: string;
          order_index: number;
          place_id?: string | null;
          place_name: string;
          summary?: string | null;
          highlight?: string | null;
          tasting_notes?: string[] | null;
          dwell_minutes?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          price_level?: string | null;
          specialties?: string[] | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          route_id?: string;
          order_index?: number;
          place_id?: string | null;
          place_name?: string;
          summary?: string | null;
          highlight?: string | null;
          tasting_notes?: string[] | null;
          dwell_minutes?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          price_level?: string | null;
          specialties?: string[] | null;
          image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'route_stops_route_id_fkey';
            columns: ['route_id'];
            referencedRelation: 'routes';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          created_at: string;
          route_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          route_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          route_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_route_id_fkey';
            columns: ['route_id'];
            referencedRelation: 'routes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      places: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          user_id: string | null;
          city_code: string;
          city_name: string;
          district_code: string | null;
          district_name: string | null;
          name: string;
          summary: string | null;
          specialties: string[] | null;
          speed_score: number | null;
          cleanliness_score: number | null;
          value_score: number | null;
          price_level: string | null;
          image_url: string | null;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string | null;
          city_code: string;
          city_name: string;
          district_code?: string | null;
          district_name?: string | null;
          name: string;
          summary?: string | null;
          specialties?: string[] | null;
          speed_score?: number | null;
          cleanliness_score?: number | null;
          value_score?: number | null;
          price_level?: string | null;
          image_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          user_id?: string | null;
          city_code?: string;
          city_name?: string;
          district_code?: string | null;
          district_name?: string | null;
          name?: string;
          summary?: string | null;
          specialties?: string[] | null;
          speed_score?: number | null;
          cleanliness_score?: number | null;
          value_score?: number | null;
          price_level?: string | null;
          image_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'places_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
