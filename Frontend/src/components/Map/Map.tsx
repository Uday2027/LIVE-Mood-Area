// src/components/Map/Map.tsx
// Renders the Leaflet map and all active pins.
// Uses useMemo on the pin list so the map doesn't re-render on unrelated state changes.
import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMapEvents, Marker, useMap } from 'react-leaflet';
import { usePinStore } from '@/store/usePinStore';
import { MoodPinMarker } from './MoodPin';
import type { Pin } from '@/api/pins';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { getNearbyEvents } from '@/api/events';
import { SpontaneousEventMarker } from './SpontaneousEventMarker';
import MarkerClusterGroup from 'react-leaflet-cluster';


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
import { useEffect } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { MoodHeatmap } from './MoodHeatmap';
import { RadarPulse } from './RadarPulse';

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
  activeRoute?: [number, number][] | null;
};

export const MapView = ({ onPinClick, onMapClick, draftCoords, focusCoords, activeRoute }: Props) => {
  const pins = usePinStore((s) => s.pins);
  const mapRef = useRef(null);
  
  const nearbyCount = useMatchStore((s) => s.nearbyCount);
  const nearbyMoods = useMatchStore((s) => s.nearbyMoods);

  const dominantMood = nearbyMoods.length > 0 ? nearbyMoods.reduce((a, b) => a.count > b.count ? a : b).mood : undefined;

  const { data: events } = useQuery({
    queryKey: ['nearbyEvents', focusCoords ?? DHAKA_CENTER],
    queryFn: () => getNearbyEvents(focusCoords?.lat ?? DHAKA_CENTER[0], focusCoords?.lng ?? DHAKA_CENTER[1]),
    refetchInterval: 60_000,
  });


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
      
      <MoodHeatmap />

      {onMapClick && <MapEvents onClick={onMapClick} />}
      <MapPanner coords={focusCoords ?? null} />
      
      {activeRoute && (
        <Polyline
          positions={activeRoute}
          pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
        />
      )}
      
      {draftCoords && (
        <>
          <Marker position={[draftCoords.lat, draftCoords.lng]} icon={draftIcon} opacity={0.6} />
          <RadarPulse 
            position={draftCoords} 
            nearbyCount={nearbyCount} 
            dominantMood={dominantMood} 
          />
        </>
      )}
      
      <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
        {markers}
      </MarkerClusterGroup>
      
      {events?.map((event: any) => (
        <SpontaneousEventMarker key={`event-${event.id}`} event={event} />
      ))}
    </MapContainer>
  );
};
