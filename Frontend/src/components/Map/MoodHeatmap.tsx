// src/components/Map/MoodHeatmap.tsx
import { useEffect, useState, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { getNeighborhoods } from '@/api/neighborhoods';
import type { Neighborhood } from '@/api/neighborhoods';
import { getMoodColor, type Mood } from '@/utils/moodColors';

type Props = {
  onNeighborhoodClick?: (id: string) => void;
};

export const MoodHeatmap = ({ onNeighborhoodClick }: Props) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const data = await getNeighborhoods();
        setNeighborhoods(data);
      } catch (e) {
        console.error('Failed to fetch neighborhoods', e);
      }
    };
    fetchNeighborhoods();
  }, []);

  const features = useMemo(() => {
    return neighborhoods.map(n => {
      if (!n.boundary) return null;
      let fillColor = '#cbd5e1'; // default gray
      let fillOpacity = 0.2;
      
      if (n.mood && n.mood.dominantMood) {
        const moodData = getMoodColor(n.mood.dominantMood as Mood);
        fillColor = moodData.bg;
        fillOpacity = Math.min(0.7, 0.2 + (n.mood.pinCount / 100) * 0.5); 
      }
      
      return (
        <GeoJSON
          key={`neighborhood-${n.id}`}
          data={n.boundary}
          eventHandlers={{
            click: () => onNeighborhoodClick?.(n.id)
          }}
          pathOptions={{
            color: fillColor,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            weight: 2,
            opacity: 0.5
          }}
        />
      );
    });
  }, [neighborhoods, onNeighborhoodClick]);

  return <>{features}</>;
};
