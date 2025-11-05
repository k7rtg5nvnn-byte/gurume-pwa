import React, { createContext, useContext, useMemo } from 'react';

import { mockData } from '@/data/mock-data';
import type { City, District, GurumeData, Place, Route } from '@/types';

export interface GurumeDataContextValue {
  data: GurumeData;
  getCityById: (id: string) => City | undefined;
  getDistrictById: (id: string) => District | undefined;
  getPlaceById: (id: string) => Place | undefined;
  getRouteById: (id: string) => Route | undefined;
  getPlacesByCityId: (cityId: string) => Place[];
  getPlacesByDistrictId: (districtId: string) => Place[];
  getRoutesByCityId: (cityId: string) => Route[];
}

const GurumeDataContext = createContext<GurumeDataContextValue | undefined>(undefined);

export function GurumeDataProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<GurumeDataContextValue>(() => {
    const cityMap = new Map(mockData.cities.map((city) => [city.id, city] as const));
    const districtMap = new Map(mockData.districts.map((district) => [district.id, district] as const));
    const placeMap = new Map(mockData.places.map((place) => [place.id, place] as const));
    const routeMap = new Map(mockData.routes.map((route) => [route.id, route] as const));

    return {
      data: mockData,
      getCityById: (id) => cityMap.get(id),
      getDistrictById: (id) => districtMap.get(id),
      getPlaceById: (id) => placeMap.get(id),
      getRouteById: (id) => routeMap.get(id),
      getPlacesByCityId: (cityId) => mockData.places.filter((place) => place.cityId === cityId),
      getPlacesByDistrictId: (districtId) => mockData.places.filter((place) => place.districtId === districtId),
      getRoutesByCityId: (cityId) => mockData.routes.filter((route) => route.cityId === cityId),
    };
  }, []);

  return <GurumeDataContext.Provider value={value}>{children}</GurumeDataContext.Provider>;
}

export function useGurumeDataContext() {
  const context = useContext(GurumeDataContext);

  if (!context) {
    throw new Error('useGurumeDataContext must be used within GurumeDataProvider');
  }

  return context;
}
