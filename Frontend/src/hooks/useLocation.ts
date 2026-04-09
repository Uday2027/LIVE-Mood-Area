// src/hooks/useLocation.ts
// Requests geolocation only on demand — never on page load, per AGENT.md.
import { useState, useCallback } from 'react';

export type Coords = { lat: number; lng: number };

type UseLocationResult = {
  coords: Coords | null;
  requesting: boolean;
  error: string | null;
  requestLocation: () => void;
};

export const useLocation = (): UseLocationResult => {
  const [coords,     setCoords]     = useState<Coords | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setRequesting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRequesting(false);
      },
      () => {
        setError('Unable to retrieve location');
        setRequesting(false);
      },
    );
  }, []);

  return { coords, requesting, error, requestLocation };
};
