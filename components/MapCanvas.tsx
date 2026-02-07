'use client';

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from 'react';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%'
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };

export function MapCanvas({ children }: { children?: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const libraries = useMemo(() => ['places', 'drawing', 'geometry'] as const, []);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as unknown as string[]
  });

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-ink/20">
        <p className="text-sm text-ink/60">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to load the map.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-ink/20">
        <p className="text-sm text-ink/60">Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={17}>
      {children}
    </GoogleMap>
  );
}
