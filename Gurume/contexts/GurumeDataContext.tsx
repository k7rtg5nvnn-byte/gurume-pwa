import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockData } from '@/data/mock-data';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { slugify } from '@/utils/slugify';
import { useAuthContext } from '@/contexts/AuthContext';
import type {
  City,
  District,
  GurumeData,
  Place,
  Route,
  RouteInput,
  RouteStop,
} from '@/types';
import type { Database } from '@/types/database';

type ProvinceApiResponse = {
  status: string;
  data: Array<{
    id: number;
    name: string;
    population?: number;
    area?: number;
    altitude?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    region?: {
      tr?: string;
      en?: string;
    };
    districts: Array<{
      id: number;
      name: string;
    }>;
  }>;
};

type RouteRow = Database['public']['Tables']['routes']['Row'] & {
  route_stops: Database['public']['Tables']['route_stops']['Row'][] | null;
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  favorites?: Array<{ count: number | null }>;
};

type FavoriteRow = Database['public']['Tables']['favorites']['Row'];

export interface GurumeDataContextValue {
  data: GurumeData;
  isLoading: boolean;
  isRefreshing: boolean;
  favoriteRouteIds: string[];
  refreshData: () => Promise<void>;
  getCityById: (id: string) => City | undefined;
  getCityBySlug: (slug: string) => City | undefined;
  getDistrictById: (id: string) => District | undefined;
  getPlaceById: (id: string) => Place | undefined;
  getRouteById: (id: string) => Route | undefined;
  getPlacesByCityId: (cityId: string) => Place[];
  getPlacesByDistrictId: (districtId: string) => Place[];
  getRoutesByCityId: (cityId: string) => Route[];
  toggleFavorite: (routeId: string) => Promise<void>;
  isRouteFavorite: (routeId: string) => boolean;
  createRoute: (input: RouteInput) => Promise<Route | null>;
}

const GurumeDataContext = createContext<GurumeDataContextValue | undefined>(undefined);

const PROVINCE_ENDPOINT = 'https://turkiyeapi.dev/api/v1/provinces';

function buildCityId(name: string) {
  return `city-${slugify(name)}`;
}

function buildDistrictId(cityName: string, districtName: string) {
  return `district-${slugify(cityName)}-${slugify(districtName)}`;
}

function mapRouteRow(
  row: RouteRow,
  cityLookup: Map<string, City>,
  districtLookup: Map<string, District>,
  favoriteIds: Set<string>,
): Route {
  const cityByCode = row.city_code ? [...cityLookup.values()].find((city) => city.code === row.city_code) : undefined;
  const districtByCode =
    row.district_code && row.city_code
      ? [...districtLookup.values()].find(
          (district) => district.code === row.district_code && cityLookup.get(district.cityId)?.code === row.city_code,
        )
      : undefined;

  const cityId = cityByCode?.id ?? row.city_name ?? row.city_code ?? '';
  const districtIds = districtByCode ? [districtByCode.id] : row.district_name ? [row.district_name] : [];

  const stops: RouteStop[] = (row.route_stops ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((stop) => ({
      id: stop.id,
      order: stop.order_index,
      placeId: stop.place_id ?? undefined,
      placeName: stop.place_name,
      placeSummary: stop.summary ?? undefined,
      tastingNotes: stop.tasting_notes ?? [],
      highlight: stop.highlight ?? '',
      dwellMinutes: stop.dwell_minutes ?? undefined,
      coordinates:
        stop.latitude && stop.longitude
          ? {
              latitude: stop.latitude,
              longitude: stop.longitude,
            }
          : undefined,
      priceLevel: (stop.price_level as RouteStop['priceLevel']) ?? undefined,
      specialties: stop.specialties ?? undefined,
      imageUrl: stop.image_url ?? undefined,
    }));

  return {
    id: row.id,
    cityId,
    districtIds,
    title: row.title,
    description: row.description ?? row.summary ?? '',
    coverImage: row.cover_image_url ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    distanceKm: row.distance_km ?? undefined,
    tags: row.tags ?? [],
    averageRating: row.average_rating ?? 4.5,
    ratingCount: row.rating_count ?? 0,
    author: {
      id: row.user_id,
      name: row.profiles?.full_name ?? 'Gurume Topluluğu',
      title: row.profiles?.bio ?? 'Topluluk Üyesi',
      avatarSeed: row.profiles?.id ?? row.user_id,
      avatarUrl: row.profiles?.avatar_url ?? undefined,
    },
    stops,
    favoriteCount: row.favorites?.[0]?.count ?? undefined,
    createdAt: row.created_at,
    isUserGenerated: true,
    isFavorite: favoriteIds.has(row.id),
  };
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  current.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function GurumeDataProvider({ children }: { children: React.ReactNode }) {
  const { sessionUserId, isSupabaseReady } = useAuthContext();

  const [cities, setCities] = useState<City[]>(mockData.cities);
  const [districts, setDistricts] = useState<District[]>(mockData.districts);
  const [places, setPlaces] = useState<Place[]>(mockData.places);
  const [routes, setRoutes] = useState<Route[]>(mockData.routes);
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const cityMap = useMemo(() => new Map(cities.map((city) => [city.id, city] as const)), [cities]);
  const citySlugMap = useMemo(() => new Map(cities.map((city) => [city.slug, city] as const)), [cities]);
  const districtMap = useMemo(() => new Map(districts.map((district) => [district.id, district] as const)), [districts]);
  const placeMap = useMemo(() => new Map(places.map((place) => [place.id, place] as const)), [places]);
  const routeMap = useMemo(() => new Map(routes.map((route) => [route.id, route] as const)), [routes]);

  const loadProvinceData = useCallback(async () => {
    try {
      const response = await fetch(PROVINCE_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Geo service responded with ${response.status}`);
      }

      const payload = (await response.json()) as ProvinceApiResponse;
      if (!payload?.data?.length) {
        return;
      }

      const incomingCities: City[] = [];
      const incomingDistricts: District[] = [];

      payload.data.forEach((province) => {
        const provinceSlug = slugify(province.name);
        const cityId = buildCityId(province.name);

        incomingCities.push({
          id: cityId,
          code: String(province.id).padStart(2, '0'),
          name: province.name,
          slug: provinceSlug,
          description: `${province.name} ilindeki yerel lezzetleri keşfet.`,
          heroImage:
            cityMap.get(cityId)?.heroImage ??
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
          highlightTags: cityMap.get(cityId)?.highlightTags ?? ['Yerel Tat', 'Gurme'],
          signatureDishes: cityMap.get(cityId)?.signatureDishes ?? [],
          coordinates: province.coordinates ?? { latitude: 39.0, longitude: 35.0 },
          region: province.region?.tr ?? province.region?.en ?? undefined,
        });

        province.districts.forEach((district) => {
          const districtId = buildDistrictId(province.name, district.name);
          incomingDistricts.push({
            id: districtId,
            cityId,
            name: district.name,
            code: String(district.id),
          });
        });
      });

      setCities((prev) => mergeById(prev, incomingCities));
      setDistricts((prev) => mergeById(prev, incomingDistricts));
    } catch (error) {
      console.warn('[GurumeDataProvider] Province fetch failed', (error as Error).message);
    }
  }, [cityMap]);

  const loadRemoteRoutes = useCallback(
    async (favorites: Set<string>) => {
      if (!isSupabaseConfigured || !isSupabaseReady || !supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('routes')
        .select('*, route_stops(*), profiles:profiles!routes_user_id_fkey(*), favorites(count)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[GurumeDataProvider] routes fetch error', error.message);
        return [];
      }

      if (!data) {
        return [];
      }

      return data.map((routeRow) => mapRouteRow(routeRow, cityMap, districtMap, favorites));
    },
    [cityMap, districtMap, isSupabaseReady],
  );

  const loadFavorites = useCallback(async () => {
    if (!isSupabaseConfigured || !isSupabaseReady || !supabase || !sessionUserId) {
      setFavoriteRouteIds([]);
      return [];
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', sessionUserId);

    if (error) {
      console.warn('[GurumeDataProvider] favorites fetch error', error.message);
      setFavoriteRouteIds([]);
      return [];
    }

    const favorites = (data ?? []) as FavoriteRow[];
    const ids = favorites.map((item) => item.route_id);
    setFavoriteRouteIds(ids);
    return ids;
  }, [isSupabaseReady, sessionUserId]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadProvinceData();
      const favoriteSet = new Set(await loadFavorites());
      const remoteRoutes = await loadRemoteRoutes(favoriteSet);

      if (remoteRoutes.length) {
        setRoutes((prev) => mergeById(prev, remoteRoutes));
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [loadFavorites, loadProvinceData, loadRemoteRoutes]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!sessionUserId) {
      setFavoriteRouteIds([]);
      setRoutes((prev) =>
        prev.map((route) => ({
          ...route,
          isFavorite: false,
        })),
      );
      return;
    }

    loadFavorites().then((ids) => {
      setRoutes((prev) =>
        prev.map((route) => ({
          ...route,
          isFavorite: ids.includes(route.id),
        })),
      );
    });
  }, [loadFavorites, sessionUserId]);

  const toggleFavorite = useCallback(
    async (routeId: string) => {
      if (!sessionUserId || !isSupabaseConfigured || !isSupabaseReady || !supabase) {
        setFavoriteRouteIds((prev) =>
          prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId],
        );
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeId
              ? {
                  ...route,
                  isFavorite: !(route.isFavorite ?? false),
                  favoriteCount:
                    (route.favoriteCount ?? 0) +
                    ((route.isFavorite ?? false) ? -1 : 1),
                }
              : route,
          ),
        );
        return;
      }

      const isAlreadyFavorite = favoriteRouteIds.includes(routeId);

      if (isAlreadyFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('route_id', routeId)
          .eq('user_id', sessionUserId);

        if (error) {
          console.warn('[GurumeDataProvider] favorite delete error', error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .upsert({ route_id: routeId, user_id: sessionUserId });

        if (error) {
          console.warn('[GurumeDataProvider] favorite upsert error', error.message);
          return;
        }
      }

      await loadFavorites();
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId
            ? {
                ...route,
                isFavorite: !isAlreadyFavorite,
                favoriteCount:
                  (route.favoriteCount ?? 0) + (isAlreadyFavorite ? -1 : 1),
              }
            : route,
        ),
      );
    },
    [favoriteRouteIds, isSupabaseReady, loadFavorites, sessionUserId],
  );

  const createRoute = useCallback(
    async (input: RouteInput) => {
      if (!sessionUserId || !isSupabaseConfigured || !isSupabaseReady || !supabase) {
        const fallbackRoute: Route = {
          id: `local-${Date.now()}`,
          cityId: input.cityId,
          districtIds: input.districtIds,
          title: input.title,
          description: input.description ?? '',
          coverImage: input.coverImage,
          durationMinutes: input.durationMinutes,
          distanceKm: input.distanceKm,
          tags: input.tags ?? [],
          averageRating: 5,
          ratingCount: 0,
          author: {
            id: sessionUserId ?? 'guest',
            name: 'Misafir',
            title: 'Demo Kullanıcısı',
            avatarSeed: sessionUserId ?? 'guest',
          },
          stops: input.stops.map((stop, index) => ({
            id: `local-stop-${Date.now()}-${index}`,
            order: stop.order,
            placeId: stop.placeId,
            placeName: stop.placeName,
            placeSummary: stop.placeSummary,
            tastingNotes: stop.tastingNotes ?? [],
            highlight: stop.highlight ?? '',
            dwellMinutes: stop.dwellMinutes,
            coordinates:
              stop.latitude && stop.longitude
                ? { latitude: stop.latitude, longitude: stop.longitude }
                : undefined,
            priceLevel: stop.priceLevel,
            specialties: stop.specialties,
            imageUrl: stop.imageUrl,
          })),
          isUserGenerated: true,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };

        setRoutes((prev) => [fallbackRoute, ...prev]);
        return fallbackRoute;
      }

      const city = cityMap.get(input.cityId);
      const primaryDistrict = input.districtIds[0] ? districtMap.get(input.districtIds[0]) : undefined;

      const { data, error } = await supabase
        .from('routes')
        .insert({
          user_id: sessionUserId,
          title: input.title,
          summary: input.summary ?? null,
          description: input.description ?? null,
          city_code: city?.code ?? null,
          city_name: city?.name ?? null,
          district_code: primaryDistrict?.code ?? null,
          district_name: primaryDistrict?.name ?? null,
          cover_image_url: input.coverImage ?? null,
          duration_minutes: input.durationMinutes ?? null,
          distance_km: input.distanceKm ?? null,
          tags: input.tags ?? [],
          is_published: input.isPublished ?? false,
          is_featured: false,
        })
        .select('*, route_stops(*), profiles:profiles!routes_user_id_fkey(*), favorites(count)')
        .single();

      if (error) {
        console.warn('[GurumeDataProvider] createRoute error', error.message);
        return null;
      }

      if (!data) {
        return null;
      }

      const routeId = data.id;

      const stopPayloads = input.stops.map((stop) => ({
        route_id: routeId,
        order_index: stop.order,
        place_id: stop.placeId ?? null,
        place_name: stop.placeName,
        summary: stop.placeSummary ?? null,
        highlight: stop.highlight ?? null,
        tasting_notes: stop.tastingNotes ?? [],
        dwell_minutes: stop.dwellMinutes ?? null,
        latitude: stop.latitude ?? null,
        longitude: stop.longitude ?? null,
        price_level: stop.priceLevel ?? null,
        specialties: stop.specialties ?? null,
        image_url: stop.imageUrl ?? null,
      }));

      if (stopPayloads.length) {
        const { error: stopError } = await supabase.from('route_stops').insert(stopPayloads);
        if (stopError) {
          console.warn('[GurumeDataProvider] createRoute stops error', stopError.message);
        }
      }

      const favoriteSet = new Set(favoriteRouteIds);
      const mappedRoute = mapRouteRow(
        {
          ...data,
          route_stops: [
            ...(data.route_stops ?? []),
            ...stopPayloads.map((stop, idx) => ({
              id: `tmp-${idx}`,
              created_at: new Date().toISOString(),
              updated_at: null,
              ...stop,
            })),
          ],
        },
        cityMap,
        districtMap,
        favoriteSet,
      );

      setRoutes((prev) => [mappedRoute, ...prev]);
      return mappedRoute;
    },
    [cityMap, districtMap, favoriteRouteIds, isSupabaseReady, sessionUserId],
  );

  const data = useMemo<GurumeData>(() => {
    const favoriteSet = new Set(favoriteRouteIds);
    const enhancedRoutes = routes.map((route) => ({
      ...route,
      isFavorite: favoriteSet.has(route.id),
    }));

    return {
      cities,
      districts,
      places,
      routes: enhancedRoutes,
    };
  }, [cities, districts, places, routes, favoriteRouteIds]);

  const value = useMemo<GurumeDataContextValue>(
    () => ({
      data,
      isLoading,
      isRefreshing,
      favoriteRouteIds,
      refreshData,
      getCityById: (id: string) => cityMap.get(id),
      getCityBySlug: (slug: string) => citySlugMap.get(slug),
      getDistrictById: (id: string) => districtMap.get(id),
      getPlaceById: (id: string) => placeMap.get(id),
      getRouteById: (id: string) => routeMap.get(id),
      getPlacesByCityId: (cityId: string) => places.filter((place) => place.cityId === cityId),
      getPlacesByDistrictId: (districtId: string) => places.filter((place) => place.districtId === districtId),
      getRoutesByCityId: (cityId: string) => data.routes.filter((route) => route.cityId === cityId),
      toggleFavorite,
      isRouteFavorite: (routeId: string) => favoriteRouteIds.includes(routeId),
      createRoute,
    }),
    [
      cityMap,
      citySlugMap,
      createRoute,
      data,
      districtMap,
      favoriteRouteIds,
      isLoading,
      isRefreshing,
      placeMap,
      places,
      refreshData,
      routeMap,
      toggleFavorite,
    ],
  );

  return <GurumeDataContext.Provider value={value}>{children}</GurumeDataContext.Provider>;
}

export function useGurumeDataContext() {
  const context = useContext(GurumeDataContext);

  if (!context) {
    throw new Error('useGurumeDataContext must be used within GurumeDataProvider');
  }

  return context;
}
