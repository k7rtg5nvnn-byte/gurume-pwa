/**
 * GOOGLE PLACES SERVICE
 * 
 * Google Places API kullanarak mekan arama
 */

import { Platform } from 'react-native';

// Google Places API Key (app.json'dan alınacak)
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  rating?: number;
  types?: string[];
}

interface PlaceSearchOptions {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // meters
  type?: string; // e.g., 'restaurant', 'cafe'
}

class PlacesService {
  /**
   * Mekan ara (Text Search)
   */
  async searchPlaces(options: PlaceSearchOptions): Promise<PlaceResult[]> {
    try {
      if (!GOOGLE_API_KEY) {
        console.warn('Google Maps API key bulunamadı - mock data kullanılıyor');
        return this.getMockPlaces(options.query);
      }

      const { query, latitude, longitude, radius = 5000, type } = options;

      // Location bias varsa ekle
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
      
      if (latitude && longitude) {
        url += `&location=${latitude},${longitude}&radius=${radius}`;
      }

      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        console.error('Places API error:', data.status);
        return this.getMockPlaces(query);
      }

      return data.results.slice(0, 10).map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        photoUrl: place.photos?.[0] 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : undefined,
        rating: place.rating,
        types: place.types,
      }));
    } catch (error) {
      console.error('searchPlaces error:', error);
      return this.getMockPlaces(options.query);
    }
  }

  /**
   * Yakındaki mekanları bul (Nearby Search)
   */
  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    type: string = 'restaurant'
  ): Promise<PlaceResult[]> {
    try {
      if (!GOOGLE_API_KEY) {
        console.warn('Google Maps API key bulunamadı - mock data kullanılıyor');
        return [];
      }

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        console.error('Nearby Places API error:', data.status);
        return [];
      }

      return data.results.slice(0, 10).map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        photoUrl: place.photos?.[0] 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : undefined,
        rating: place.rating,
        types: place.types,
      }));
    } catch (error) {
      console.error('getNearbyPlaces error:', error);
      return [];
    }
  }

  /**
   * Mekan detaylarını getir
   */
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      if (!GOOGLE_API_KEY) {
        console.warn('Google Maps API key bulunamadı - mock data kullanılıyor');
        return null;
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        console.error('Place Details API error:', data.status);
        return null;
      }

      const place = data.result;

      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        photoUrl: place.photos?.[0] 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : undefined,
        rating: place.rating,
        types: place.types,
      };
    } catch (error) {
      console.error('getPlaceDetails error:', error);
      return null;
    }
  }

  /**
   * Autocomplete (Mekan önerileri)
   */
  async autocomplete(input: string, sessionToken?: string): Promise<Array<{ placeId: string; description: string }>> {
    try {
      if (!GOOGLE_API_KEY || input.length < 2) {
        return [];
      }

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&types=establishment`;
      
      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.predictions) {
        console.error('Autocomplete API error:', data.status);
        return [];
      }

      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
      }));
    } catch (error) {
      console.error('autocomplete error:', error);
      return [];
    }
  }

  /**
   * Mock mekan verileri (API olmadığında)
   */
  private getMockPlaces(query: string): PlaceResult[] {
    return [
      {
        placeId: 'mock-1',
        name: `${query} Restoran`,
        address: 'Test Mahallesi, Test Caddesi No:1',
        latitude: 41.0082,
        longitude: 28.9784,
        rating: 4.5,
      },
      {
        placeId: 'mock-2',
        name: `${query} Cafe`,
        address: 'Test Mahallesi, Test Sokak No:5',
        latitude: 41.0092,
        longitude: 28.9794,
        rating: 4.2,
      },
      {
        placeId: 'mock-3',
        name: `${query} Pastane`,
        address: 'Test Mahallesi, Test Bulvarı No:15',
        latitude: 41.0072,
        longitude: 28.9774,
        rating: 4.8,
      },
    ];
  }
}

export const placesService = new PlacesService();
