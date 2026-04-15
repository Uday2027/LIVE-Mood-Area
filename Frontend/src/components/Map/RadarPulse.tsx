// src/components/Map/RadarPulse.tsx
import { useMemo } from 'react';
import { Circle, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { getMoodColor, type Mood } from '@/utils/moodColors';

type Props = {
  position: { lat: number; lng: number };
  radiusMeters?: number;
  nearbyCount: number;
  dominantMood?: Mood;
  onClick?: () => void;
};

export const RadarPulse = ({ position, radiusMeters = 2000, nearbyCount, dominantMood, onClick }: Props) => {
  const { bg, border } = dominantMood ? getMoodColor(dominantMood) : { bg: '#cbd5e1', border: '#94a3b8' };

  // Inner pulsing circle marker
  const pulseIcon = useMemo(() => {
    return L.divIcon({
      className: 'radar-pulse-icon',
      html: `
        <div style="
          width: 50px; 
          height: 50px; 
          background-color: ${bg}; 
          border: 2px solid ${border};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          cursor: pointer;
          font-weight: bold;
          color: #333;
          box-shadow: 0 0 15px ${bg};
        ">
          ${nearbyCount > 0 ? nearbyCount : ''}
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  }, [bg, border, nearbyCount]);

  return (
    <>
      <Circle
        center={[position.lat, position.lng]}
        radius={radiusMeters}
        pathOptions={{
          color: border,
          fillColor: bg,
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 10'
        }}
      />
      <Marker
        position={[position.lat, position.lng]}
        icon={pulseIcon}
        eventHandlers={{ click: onClick }}
      >
        <Tooltip>
          {nearbyCount} vibes nearby
        </Tooltip>
      </Marker>
    </>
  );
};
