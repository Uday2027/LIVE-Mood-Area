// src/hooks/useNearby.ts
import { useEffect } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { getNearbyMatches } from '@/api/matches';
import { useLocation } from './useLocation';

export const useNearby = () => {
  const { coords, requestLocation } = useLocation();
  const setNearbyCount = useMatchStore((s) => s.setNearbyCount);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchNearby = async () => {
      // Ensure we have coords before fetching
      if (!coords) {
        requestLocation();
        return;
      }
      
      try {
        const result = await getNearbyMatches(coords.lat, coords.lng);
        setNearbyCount(result.totalNearby, result.byMood);
      } catch (error) {
        console.error('Failed to fetch nearby matches:', error);
      }
    };

    // Fetch immediately if we have coords, or try to get coords
    fetchNearby();

    // Poll every 60s
    interval = setInterval(fetchNearby, 60000);

    return () => clearInterval(interval);
  }, [coords, requestLocation, setNearbyCount]);
};
