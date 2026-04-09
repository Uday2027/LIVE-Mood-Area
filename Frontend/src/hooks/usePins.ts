// src/hooks/usePins.ts
// Loads active pins on mount and exposes a refetch helper.
import { useEffect, useCallback, useState } from 'react';
import { getPins } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';

type UsePinsResult = {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const usePins = (): UsePinsResult => {
  const setPins              = usePinStore((s) => s.setPins);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPins();
      setPins(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load pins');
    } finally {
      setLoading(false);
    }
  }, [setPins]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { loading, error, refetch };
};
