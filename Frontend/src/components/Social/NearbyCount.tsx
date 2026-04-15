// src/components/Social/NearbyCount.tsx
import { useState, useEffect } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { Users } from 'lucide-react';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { cn } from '@/lib/utils';
import { useNearby } from '@/hooks/useNearby';

type Props = {
  onOpenMatchPanel: () => void;
};

export const NearbyCount = ({ onOpenMatchPanel }: Props) => {
  // Initialize polling hook
  useNearby();

  const { nearbyCount, nearbyMoods } = useMatchStore();
  const [animate, setAnimate] = useState(false);

  // Bounce animation when count changes
  useEffect(() => {
    if (nearbyCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [nearbyCount]);

  if (nearbyCount === 0) {
    return (
      <div className="absolute right-4 top-20 z-[400] flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all hover:bg-white border border-gray-100">
        <Users className="size-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">You're the only one here — set the vibe!</span>
      </div>
    );
  }

  return (
    <div className="absolute right-4 top-20 z-[400] group">
      <button
        onClick={onOpenMatchPanel}
        className={cn(
          "flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white border border-gray-100",
          animate && "animate-bounce"
        )}
      >
        <div className="relative">
          <Users className="size-5 text-indigo-500" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white">
            {nearbyCount > 9 ? '9+' : nearbyCount}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-700">{nearbyCount} nearby</span>
      </button>

      {/* Hover Dropdown */}
      <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-xl border border-gray-100 bg-white p-3 shadow-xl opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Vibe Breakdown</div>
        <div className="flex flex-col gap-2">
          {nearbyMoods.length > 0 ? (
             nearbyMoods.map(({ mood, count }) => (
              <div key={mood} className="flex items-center justify-between">
                <MoodBadge mood={mood} size="sm" />
                <span className="text-xs font-semibold text-gray-600">{count}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No moods shared yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
