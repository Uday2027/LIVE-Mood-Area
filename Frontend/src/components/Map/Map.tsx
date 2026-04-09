// src/components/Map/Map.tsx
// Renders the Leaflet map and all active pins.
// Uses useMemo on the pin list so the map doesn't re-render on unrelated state changes.
import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { usePinStore } from '@/store/usePinStore';
import { MoodPinMarker } from './MoodPin';
import type { Pin } from '@/api/pins';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dhaka default centre
const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 13;

// Default leaflet icon hack for the draft marker
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
const draftIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

import { useMapEvents, Marker, useMap } from 'react-leaflet';
import { useEffect } from 'react';

function MapPanner({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { duration: 1.0 });
    }
  }, [coords, map]);
  return null;
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = { 
  onPinClick: (pin: Pin) => void;
  onMapClick?: (lat: number, lng: number) => void;
  draftCoords?: { lat: number, lng: number } | null;
  focusCoords?: { lat: number, lng: number } | null;
};

export const MapView = ({ onPinClick, onMapClick, draftCoords, focusCoords }: Props) => {
  const pins       = usePinStore((s) => s.pins);
  const mapRef     = useRef(null);

  const validPins = useMemo(() => {
    // Defensively filter any malformed pins that might accidentally exist in Zustand
    return pins.filter((p) => p && p.id && typeof p.latitude === 'number' && typeof p.longitude === 'number');
  }, [pins]);

  const markers = useMemo(
    () => validPins.map((pin) => (
      <MoodPinMarker key={`pin-${pin.id}`} pin={pin} onClick={onPinClick} />
    )),
    [validPins, onPinClick],
  );

  return (
    <MapContainer
      center={DHAKA_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick && <MapEvents onClick={onMapClick} />}
      <MapPanner coords={focusCoords ?? null} />
      {draftCoords && (
        <Marker position={[draftCoords.lat, draftCoords.lng]} icon={draftIcon} opacity={0.6} />
      )}
      {markers}
    </MapContainer>
  );
};
