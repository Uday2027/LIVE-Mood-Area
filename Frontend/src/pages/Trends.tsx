// src/pages/Trends.tsx
// Neighborhood mood history page — fetches on mount, renders TrendChart per zone.
import { useEffect, useState } from 'react';
import {
  getNeighborhoods,
  getNeighborhoodHistory,
  type Neighborhood,
  type MoodSnapshot,
} from '@/api/neighborhoods';
import { TrendChart } from '@/components/Charts/TrendChart';
import { MoodBadge } from '@/components/UI/MoodBadge';

type ZoneHistory = { neighborhood: Neighborhood; snapshots: MoodSnapshot[] };

export default function Trends() {
  const [data,    setData]    = useState<ZoneHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const zones = await getNeighborhoods();
        const histories = await Promise.all(
          zones.map(async (z) => ({
            neighborhood: z,
            snapshots:    await getNeighborhoodHistory(z.id),
          })),
        );
        setData(histories);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load trends');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="flex h-64 items-center justify-center text-sm text-red-500">{error}</div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mood Trends</h1>
      <div className="space-y-8">
        {data.map(({ neighborhood, snapshots }) => {
          const latest = snapshots[snapshots.length - 1];
          return (
            <section key={neighborhood.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{neighborhood.name}</h2>
                  <p className="text-sm text-gray-500">{neighborhood.city}</p>
                </div>
                {latest?.dominantMood && (
                  <div className="flex items-center gap-2">
                    <MoodBadge mood={latest.dominantMood} className="text-sm" />
                    <span className="text-xs text-gray-400">{latest.pinCount} pins</span>
                  </div>
                )}
              </div>
              {snapshots.length > 0 ? (
                <TrendChart snapshots={snapshots} />
              ) : (
                <p className="text-sm text-gray-400">No data available yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
