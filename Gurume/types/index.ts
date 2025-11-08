/**
 * GURUME TYPE DEFINITIONS
 * 
 * Tüm uygulama için TypeScript type tanımlamaları
 * Supabase ile tam uyumlu, genişletilebilir yapı
 */

// ============= GEO & LOCATION =============

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
  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  createdAt?: string;
}

// ============= USERS & AUTHENTICATION =============

export interface User {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  instagramHandle?: string;
  websiteUrl?: string;
  isVerified: boolean;
  totalRoutes: number;
  totalReviews: number;
  averageRouteRating: number;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  favoriteRouteIds: string[];
  favoriteCityIds: string[];
  dietaryPreferences: string[];
  budgetPreference: 'budget' | 'moderate' | 'premium' | 'any';
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ============= PLACES & VENUES =============

export interface Place {
  id: string;
  cityId: string;
  districtId: string;
  name: string;
  summary: string;
  description?: string;
  specialties: string[];
  speedScore: number;
  cleanlinessScore: number;
  valueScore: number;
  priceLevel: '₺' | '₺₺' | '₺₺₺';
  heroImage: string;
  images: string[];
  coordinates: Coordinates;
  address?: string;
  phoneNumber?: string;
  openingHours?: string;
  website?: string;
  instagramHandle?: string;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============= ROUTES & JOURNEYS =============

export interface RouteStop {
  order: number;
  placeId: string;
  tastingNotes: string[];
  highlight: string;
  dwellMinutes: number;
  arrivalTime?: string;
  transportMode?: 'walking' | 'driving' | 'public_transport' | 'bike';
  notes?: string;
}

export interface Author {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export interface Route {
  id: string;
  authorId: string;
  author: Author;
  cityId: string;
  districtIds: string[];
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  durationMinutes: number;
  distanceKm: number;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  budgetRange: 'budget' | 'moderate' | 'premium';
  bestTimeToVisit?: string;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  saveCount: number;
  shareCount: number;
  stops: RouteStop[];
  isPublished: boolean;
  isVerified: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CreateRouteInput {
  cityId: string;
  districtIds: string[];
  title: string;
  description: string;
  coverImage: string;
  images?: string[];
  durationMinutes: number;
  distanceKm: number;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  budgetRange: 'budget' | 'moderate' | 'premium';
  stops: RouteStop[];
}

export interface UpdateRouteInput extends Partial<CreateRouteInput> {
  id: string;
}

// ============= RATINGS & REVIEWS =============

export interface RouteRating {
  id: string;
  routeId: string;
  userId: string;
  user?: Pick<User, 'id' | 'username' | 'avatarUrl' | 'isVerified'>;
  score: number;
  comment: string;
  images?: string[];
  visitedAt: string;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingInput {
  routeId: string;
  score: number;
  comment: string;
  images?: string[];
  visitedAt: string;
}

// ============= IMAGE UPLOAD =============

export interface ImageUpload {
  id: string;
  userId: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

// ============= SEARCH & FILTERS =============

export interface SearchFilters {
  query?: string;
  cityIds?: string[];
  districtIds?: string[];
  tags?: string[];
  budgetRange?: ('budget' | 'moderate' | 'premium')[];
  difficulty?: ('easy' | 'moderate' | 'challenging')[];
  minRating?: number;
  sortBy?: 'relevance' | 'rating' | 'popular' | 'newest' | 'distance';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= INTERACTIONS =============

export interface UserFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface RouteSave {
  userId: string;
  routeId: string;
  createdAt: string;
}

// ============= DATA CONTEXTS =============

export interface UserPreference {
  id: string;
  userId: string;
  favoriteCityIds: string[];
  favoriteRouteIds: string[];
  dietaryNotes: string[];
  budgetPreference: 'budget' | 'moderate' | 'premium' | 'any';
  createdAt: string;
  updatedAt: string;
}

export type GurumeData = {
  cities: City[];
  districts: District[];
  places: Place[];
  routes: Route[];
};

// ============= API RESPONSES =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
