export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  highlightTags: string[];
  signatureDishes: string[];
  coordinates: Coordinates;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

export interface Place {
  id: string;
  cityId: string;
  districtId: string;
  name: string;
  summary: string;
  specialties: string[];
  speedScore: number;
  cleanlinessScore: number;
  valueScore: number;
  priceLevel: '₺' | '₺₺' | '₺₺₺';
  heroImage: string;
  coordinates: Coordinates;
}

export interface RouteStop {
  order: number;
  placeId: string;
  tastingNotes: string[];
  highlight: string;
  dwellMinutes: number;
}

export interface Author {
  id: string;
  name: string;
  title: string;
  avatarSeed: string;
}

export interface Route {
  id: string;
  cityId: string;
  districtIds: string[];
  title: string;
  description: string;
  coverImage: string;
  durationMinutes: number;
  distanceKm: number;
  tags: string[];
  averageRating: number;
  ratingCount: number;
  author: Author;
  stops: RouteStop[];
}

export interface RouteRating {
  id: string;
  routeId: string;
  userId: string;
  score: number;
  comment: string;
  visitedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  favoriteCityIds: string[];
  dietaryNotes: string[];
}

export type GurumeData = {
  cities: City[];
  districts: District[];
  places: Place[];
  routes: Route[];
};
