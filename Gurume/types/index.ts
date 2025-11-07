export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  code?: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  highlightTags: string[];
  signatureDishes: string[];
  coordinates: Coordinates;
  region?: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
  code?: string;
  coordinates?: Coordinates;
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
  districtId?: string;
  authorId?: string | null;
  isFeatured?: boolean;
}

export interface RouteStop {
  id?: string;
  order: number;
  placeId?: string;
  placeName?: string;
  placeSummary?: string;
  highlight: string;
  tastingNotes: string[];
  dwellMinutes?: number;
  coordinates?: Coordinates;
  specialties?: string[];
  priceLevel?: '₺' | '₺₺' | '₺₺₺';
  imageUrl?: string;
}

export interface Author {
  id: string;
  name: string;
  title: string;
  avatarSeed: string;
  avatarUrl?: string | null;
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
  isFeatured?: boolean;
  isUserGenerated?: boolean;
  createdAt?: string;
  favoriteCount?: number;
  distanceKm?: number;
  durationMinutes?: number;
  isFavorite?: boolean;
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

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  cityCode?: string | null;
  districtCode?: string | null;
  createdAt?: string;
}

export interface AuthState {
  isLoading: boolean;
  isSupabaseReady: boolean;
  sessionUserId: string | null;
  profile: UserProfile | null;
}

export interface AuthActions {
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { email: string; password: string; phone?: string | null; fullName?: string | null }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

export interface RouteStopInput {
  order: number;
  placeId?: string;
  placeName: string;
  placeSummary?: string;
  tastingNotes?: string[];
  highlight?: string;
  dwellMinutes?: number;
  latitude?: number;
  longitude?: number;
  priceLevel?: '₺' | '₺₺' | '₺₺₺';
  specialties?: string[];
  imageUrl?: string;
}

export interface RouteInput {
  title: string;
  summary?: string;
  description?: string;
  cityId: string;
  districtIds: string[];
  coverImage?: string;
  durationMinutes?: number;
  distanceKm?: number;
  tags?: string[];
  stops: RouteStopInput[];
  isPublished?: boolean;
}
