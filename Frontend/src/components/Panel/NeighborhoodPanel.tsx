// src/components/Panel/NeighborhoodPanel.tsx
import { useEffect, useState } from 'react';
import { getNeighborhoods, getNeighborhoodMood, type Neighborhood, type MoodSummary } from '@/api/neighborhoods';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { cn } from '@/lib/utils';

export const NeighborhoodPanel = () => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [moods,         setMoods]         = useState<Record<string, MoodSummary>>({});
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const zones = await getNeighborhoods();
        setNeighborhoods(zones);
        const moodResults = await Promise.all(
          zones.map((z) => getNeighborhoodMood(z.id).then((m) => [z.id, m] as const)),
        );
        setMoods(Object.fromEntries(moodResults));
      } catch {
        // swallow — panel is non-critical
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Neighborhood Moods
      </h3>
      {neighborhoods.map((n) => {
        const mood = moods[n.id];
        return (
          <div
            key={n.id}
            className={cn(
              'flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm',
            )}
          >
            <span className="text-sm font-medium text-gray-800">{n.name}</span>
            {mood?.dominantMood ? (
              <div className="flex items-center gap-2">
                <MoodBadge mood={mood.dominantMood} />
                <span className="text-xs text-gray-400">{mood.pinCount} pins</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No data</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
