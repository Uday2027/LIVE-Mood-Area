// src/pages/Trends.tsx
// Neighborhood mood history page — fetches on mount, renders TrendChart per zone.
import { useEffect, useState, useMemo } from 'react';
import {
  getNeighborhoods,
  getNeighborhoodHistory,
  type Neighborhood,
  type MoodSnapshot,
} from '@/api/neighborhoods';
import { TrendChart } from '@/components/Charts/TrendChart';
import { MoodDistributionChart } from '@/components/Charts/MoodDistributionChart';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { usePinStore } from '@/store/usePinStore';
import { Users, MapPin, Activity, Zap } from 'lucide-react';

type ZoneHistory = { neighborhood: Neighborhood; snapshots: MoodSnapshot[] };

export default function Trends() {
  const pins = usePinStore((s) => s.pins);
  const [data,    setData]    = useState<ZoneHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const zones = await getNeighborhoods();
        const histories = await Promise.all(
          (zones || []).map(async (z) => ({
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

  const globalStats = useMemo(() => {
    if (pins.length === 0) return null;
    const moodCounts: Record<string, number> = {};
    pins.forEach(p => moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1);
    
    const dominant = Object.entries(moodCounts).sort((a,b) => b[1] - a[1])[0][0];
    
    return {
      totalPins: pins.length,
      dominantMood: dominant,
      uniqueLocations: new Set(pins.map(p => `${p.latitude},${p.longitude}`)).size,
    };
  }, [pins]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Analyzing city vibes...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center text-sm text-red-500 bg-gray-50/50">{error}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-3">
             <Activity className="size-3" /> Real-time Analytics
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">City Trends</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">
            Deep dive into the collective mood of your city. 
            See how energy flows through neighborhoods in real-time.
          </p>
        </header>

        {/* Global Summary Cards */}
        {globalStats && (
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
               <div className="absolute -right-4 -top-4 text-indigo-50 opacity-10">
                 <Zap className="size-24 scale-150" />
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Activity className="size-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Intensity</span>
               </div>
               <p className="text-3xl font-black text-gray-900">{globalStats.totalPins}</p>
               <p className="text-sm text-gray-500 mt-1">Total moods shared today</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <MapPin className="size-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Coverage</span>
               </div>
               <p className="text-3xl font-black text-gray-900">{globalStats.uniqueLocations}</p>
               <p className="text-sm text-gray-500 mt-1">Unique hot-spots identified</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Users className="size-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dominant Vibe</span>
               </div>
               <div className="flex items-center gap-2 mt-1">
                 <MoodBadge mood={globalStats.dominantMood} />
               </div>
               <p className="text-sm text-gray-500 mt-2">Leading the city right now</p>
            </div>
          </div>
        )}

        {/* Global Distribution & Neighborhoods Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <Zap className="size-5 text-indigo-500" /> Neighborhood Breakdowns
            </h3>
            
            {data.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <MapPin className="mx-auto mb-4 size-10 text-gray-300" />
                <h4 className="text-lg font-bold text-gray-900">No Neighborhood Data Yet</h4>
                <p className="text-sm text-gray-500 mt-2">Start dropping pins to generate historical insights.</p>
              </div>
            ) : (
              data.map(({ neighborhood, snapshots }) => (
                <section key={neighborhood.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-gray-50 px-6 py-5 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{neighborhood.name}</h2>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{neighborhood.city}</p>
                      </div>
                      {snapshots[snapshots.length - 1]?.dominantMood && (
                        <MoodBadge mood={snapshots[snapshots.length - 1].dominantMood} size="sm" />
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {snapshots.length > 0 ? (
                      <TrendChart snapshots={snapshots} />
                    ) : (
                      <div className="flex h-[200px] items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400 italic">
                        Insufficient local history for this zone.
                      </div>
                    )}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Sidebar / Distribution */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
               <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50 pb-4">
                 Vibe Distribution
               </h3>
               <MoodDistributionChart pins={pins} />
               <div className="mt-6 flex flex-col gap-3">
                 <p className="text-xs text-gray-500 leading-relaxed italic">
                   "This chart analyzes every single active pin currently live on our map, 
                   giving you a bird's-eye view of the city's overall energy."
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
