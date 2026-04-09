// src/components/Map/Map.tsx
// Renders the Leaflet map and all active pins.
// Uses useMemo on the pin list so the map doesn't re-render on unrelated state changes.
import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { usePinStore } from '@/store/usePinStore';
import { MoodPinMarker } from './MoodPin';
import type { Pin } from '@/api/pins';
import 'leaflet/dist/leaflet.css';

// Dhaka default centre
const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 13;

type Props = { onPinClick: (pin: Pin) => void };

export const MapView = ({ onPinClick }: Props) => {
  const pins       = usePinStore((s) => s.pins);
  const mapRef     = useRef(null);

  const markers = useMemo(
    () => pins.map((pin) => (
      <MoodPinMarker key={pin.id} pin={pin} onClick={onPinClick} />
    )),
    [pins, onPinClick],
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
      {markers}
    </MapContainer>
  );
};
