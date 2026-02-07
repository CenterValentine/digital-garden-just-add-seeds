'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Autocomplete, DrawingManager, Polygon } from '@react-google-maps/api';
import { MapCanvas } from '@/components/MapCanvas';
import { SectionShell } from '@/components/SectionShell';

type GardenSummary = {
  id: string;
  baseLocation: { lat: number; lng: number };
  propertyBoundaryGeoJSON?: GeoJSONPolygon | null;
  propertyBoundarySqM?: number | null;
  areas: GardenArea[];
};

type GardenArea = {
  id: string;
  name: string;
  polygonGeoJSON: GeoJSONPolygon;
  areaSqM: number;
};

type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

type PendingConfirm = {
  areaId: string;
  polygonGeoJSON: GeoJSONPolygon;
  areaSqM: number;
  outsidePlants: { id: string; name: string }[];
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };

export default function PlanPage() {
  const { data: session } = useSession();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [garden, setGarden] = useState<GardenSummary | null>(null);
  const [baseLocation, setBaseLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [drawingMode, setDrawingMode] = useState<'PROPERTY' | 'AREA' | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const polygonRefs = useRef(new Map<string, google.maps.Polygon>());

  useEffect(() => {
    const loadGarden = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/garden?userId=${session.user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.garden) return;
      setGarden(data.garden);
      setBaseLocation(data.garden.baseLocation ?? null);
    };

    loadGarden();
  }, [session?.user?.id]);

  const drawingOptions = useMemo<google.maps.drawing.DrawingManagerOptions>(
    () => ({
      drawingControl: false,
      drawingMode: drawingMode ? google.maps.drawing.OverlayType.POLYGON : null,
      polygonOptions: {
        fillColor: drawingMode === 'PROPERTY' ? '#2d6a4f' : '#95d5b2',
        fillOpacity: drawingMode === 'PROPERTY' ? 0.18 : 0.25,
        strokeColor: '#2d6a4f',
        strokeOpacity: 0.9,
        strokeWeight: 2
      }
    }),
    [drawingMode]
  );

  const handlePlaceChanged = async () => {
    if (!searchBox || !map) return;
    const place = searchBox.getPlace();
    const location = place.geometry?.location;
    if (!location || !session?.user?.id) return;

    const center = { lat: location.lat(), lng: location.lng() };
    map.panTo(center);
    map.setZoom(18);
    setBaseLocation(center);
    setError(null);

    if (!garden) {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          name: 'My Garden',
          baseLocation: center,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });
      if (!res.ok) {
        setError('Unable to create garden. Check your connection.');
        return;
      }
      const data = await res.json();
      setGarden({
        id: data.garden.id,
        baseLocation: center,
        propertyBoundaryGeoJSON: data.garden.propertyBoundaryGeoJSON,
        propertyBoundarySqM: data.garden.propertyBoundarySqM,
        areas: []
      });
    }
  };

  const handlePolygonComplete = async (polygon: google.maps.Polygon) => {
    if (!garden || !baseLocation) {
      polygon.setMap(null);
      setError('Search for a location before drawing boundaries.');
      return;
    }

    const path = polygon.getPath();
    const points = path.getArray().map((point) => [point.lng(), point.lat()]);
    const geoJSON: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [[...points, points[0]]]
    };
    const areaSqM = google.maps.geometry.spherical.computeArea(path);

    if (drawingMode === 'PROPERTY') {
      const res = await fetch('/api/garden/property-boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gardenId: garden.id,
          polygonGeoJSON: geoJSON,
          areaSqM,
          baseLocation
        })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error ?? 'Unable to save property boundary.');
        polygon.setMap(null);
        return;
      }

      const data = await res.json();
      setGarden((prev) =>
        prev
          ? {
              ...prev,
              propertyBoundaryGeoJSON: data.garden.propertyBoundaryGeoJSON,
              propertyBoundarySqM: data.garden.propertyBoundarySqM
            }
          : prev
      );
      setDrawingMode(null);
      setError(null);
      polygon.setMap(null);
      return;
    }

    if (drawingMode === 'AREA') {
      if (!garden.propertyBoundaryGeoJSON) {
        setError('Set your property boundary before adding planting areas.');
        polygon.setMap(null);
        return;
      }

      const res = await fetch('/api/garden/area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gardenId: garden.id,
          name: `Planting Area ${garden.areas.length + 1}`,
          polygonGeoJSON: geoJSON,
          areaSqM,
          baseLocation
        })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error ?? 'Unable to save planting area.');
        polygon.setMap(null);
        return;
      }

      const data = await res.json();
      setGarden((prev) => (prev ? { ...prev, areas: [...prev.areas, data.area] } : prev));
      setDrawingMode(null);
      setError(null);
      polygon.setMap(null);
    }
  };

  const handleSaveAreaEdit = async (areaId: string) => {
    if (!baseLocation) return;
    const polygon = polygonRefs.current.get(areaId);
    if (!polygon) return;

    const path = polygon.getPath();
    const points = path.getArray().map((point) => [point.lng(), point.lat()]);
    const geoJSON: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [[...points, points[0]]]
    };
    const areaSqM = google.maps.geometry.spherical.computeArea(path);

    const res = await fetch(`/api/garden/area/${areaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        polygonGeoJSON: geoJSON,
        areaSqM,
        baseLocation,
        confirmDelete: false
      })
    });

    if (res.status === 409) {
      const payload = await res.json();
      setPendingConfirm({
        areaId,
        polygonGeoJSON: geoJSON,
        areaSqM,
        outsidePlants: payload.outsidePlants ?? []
      });
      return;
    }

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.error ?? 'Unable to update planting area.');
      return;
    }

    const data = await res.json();
    setGarden((prev) =>
      prev
        ? {
            ...prev,
            areas: prev.areas.map((area) => (area.id === data.area.id ? data.area : area))
          }
        : prev
    );
    setEditingAreaId(null);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingConfirm || !baseLocation) return;

    const res = await fetch(`/api/garden/area/${pendingConfirm.areaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        polygonGeoJSON: pendingConfirm.polygonGeoJSON,
        areaSqM: pendingConfirm.areaSqM,
        baseLocation,
        confirmDelete: true
      })
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.error ?? 'Unable to update planting area.');
      return;
    }

    const data = await res.json();
    setGarden((prev) =>
      prev
        ? {
            ...prev,
            areas: prev.areas.map((area) => (area.id === data.area.id ? data.area : area))
          }
        : prev
    );
    setPendingConfirm(null);
    setEditingAreaId(null);
  };

  const gardenAreas = garden?.areas ?? [];

  return (
    <SectionShell title="Plan">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass h-[520px] rounded-2xl p-3 shadow-glass">
          <MapCanvas center={baseLocation ?? defaultCenter} onLoad={setMap}>
            <DrawingManager options={drawingOptions} onPolygonComplete={handlePolygonComplete} />
            {garden?.propertyBoundaryGeoJSON ? (
              <Polygon
                paths={garden.propertyBoundaryGeoJSON.coordinates[0].map(([lng, lat]) => ({
                  lat,
                  lng
                }))}
                options={{
                  fillColor: '#2d6a4f',
                  fillOpacity: 0.12,
                  strokeColor: '#2d6a4f',
                  strokeOpacity: 0.9,
                  strokeWeight: 2,
                  clickable: false,
                  editable: false
                }}
              />
            ) : null}
            {gardenAreas.map((area) => (
              <Polygon
                key={area.id}
                paths={area.polygonGeoJSON.coordinates[0].map(([lng, lat]) => ({ lat, lng }))}
                editable={editingAreaId === area.id}
                options={{
                  fillColor: '#95d5b2',
                  fillOpacity: editingAreaId === area.id ? 0.35 : 0.22,
                  strokeColor: '#2d6a4f',
                  strokeOpacity: 0.85,
                  strokeWeight: 2
                }}
                onLoad={(poly) => polygonRefs.current.set(area.id, poly)}
                onUnmount={() => polygonRefs.current.delete(area.id)}
              />
            ))}
          </MapCanvas>
        </div>
        <aside className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-glass">
          <div>
            <h2 className="text-xl font-display text-ink">Property Boundary</h2>
            <p className="mt-2 text-sm text-ink/70">
              Define the outer boundary of your property. Irrigation, furniture, and artifacts live at
              this level, while plants belong to planting areas.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">Search location</p>
            <Autocomplete onLoad={setSearchBox} onPlaceChanged={handlePlaceChanged}>
              <input
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-2 text-sm"
                placeholder="Search address"
              />
            </Autocomplete>
            <p className="mt-2 text-xs text-ink/60">
              Select a place to set your garden’s base location.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">Property boundary</p>
            <p className="mt-1 text-xs text-ink/60">
              One boundary per garden. This defines where property-level items can be placed.
            </p>
            <button
              className="mt-3 w-full rounded-full bg-ink px-4 py-2 text-sm text-white"
              onClick={() => setDrawingMode('PROPERTY')}
              disabled={!garden || !!garden.propertyBoundaryGeoJSON}
            >
              {garden?.propertyBoundaryGeoJSON ? 'Boundary set' : 'Set property boundary'}
            </button>
          </div>
          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-semibold text-ink">Planting areas</p>
            <p className="mt-1 text-xs text-ink/60">
              Planting areas are for plants only. Adjusting boundaries may remove plants outside the
              area.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {gardenAreas.length === 0 ? (
                <li className="rounded-xl border border-ink/10 p-3 text-xs text-ink/60">
                  No planting areas yet.
                </li>
              ) : (
                gardenAreas.map((area) => (
                  <li key={area.id} className="rounded-xl border border-ink/10 p-3">
                    <p className="font-medium text-ink">{area.name}</p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <button
                        className="rounded-full border border-ink/20 px-3 py-1"
                        onClick={() => setEditingAreaId(area.id)}
                      >
                        Edit boundary
                      </button>
                      {editingAreaId === area.id ? (
                        <button
                          className="rounded-full bg-ink px-3 py-1 text-white"
                          onClick={() => handleSaveAreaEdit(area.id)}
                        >
                          Save changes
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
            <button
              className="mt-3 w-full rounded-full border border-ink/20 px-4 py-2 text-sm"
              onClick={() => setDrawingMode('AREA')}
              disabled={!garden?.propertyBoundaryGeoJSON}
            >
              Add planting area
            </button>
          </div>
        </aside>
      </div>

      {pendingConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-glass">
            <h3 className="text-lg font-display text-ink">Plants outside boundary</h3>
            <p className="mt-2 text-sm text-ink/70">
              This boundary change places the following plants outside the planting area. Continuing
              will permanently delete them. To keep them, cancel and move plants inside the
              boundary.
            </p>
            <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm text-ink/80">
              {pendingConfirm.outsidePlants.map((plant) => (
                <li key={plant.id} className="rounded-xl border border-ink/10 px-3 py-2">
                  {plant.name}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-full border border-ink/20 px-4 py-2 text-sm"
                onClick={() => setPendingConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-ink px-4 py-2 text-sm text-white"
                onClick={handleConfirmDelete}
              >
                Continue & delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}
