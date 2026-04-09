// src/components/Panel/NeighborhoodPanel.tsx
import { usePinStore } from '@/store/usePinStore';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { getMoodColor, MOOD_COLORS, type Mood } from '@/utils/moodColors';
import { cn } from '@/lib/utils';
import { MapPin, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { Pin } from '@/api/pins';

// Calculates a quick relative time string
const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000); // mins
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
};

// Global cache to prevent re-fetching the same IP reverse-geo
const GEO_CACHE: Record<string, string> = {};

const PinLocationName = ({ pin }: { pin: Pin }) => {
  const [name, setName] = useState<string | null>(GEO_CACHE[pin.id] || null);

  useEffect(() => {
    if (name || pin.message) return;
    
    let mounted = true;
    const fetchGeo = async () => {
      try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pin.latitude}&longitude=${pin.longitude}&localityLanguage=en`;
        const res = await fetch(url);
        const data = await res.json();
        const resolved = data.locality || data.city || data.principalSubdivision || 'Unknown Location';
        if (mounted) {
           GEO_CACHE[pin.id] = resolved;
           setName(resolved);
        }
      } catch {
        if (mounted) setName('Unknown Location');
      }
    };
    fetchGeo();
    return () => { mounted = false; };
  }, [pin.id, pin.latitude, pin.longitude, pin.message, name]);

  if (pin.message) return <>{pin.message}</>;
  return <>{name || 'Resolving...'}</>;
};

type Props = {
  onPinClick: (pin: Pin) => void;
};

// List of all Moods to group by
const MOODS: Mood[] = Object.keys(MOOD_COLORS) as Mood[];

export const NeighborhoodPanel = ({ onPinClick }: Props) => {
  const pins = usePinStore((s) => s.pins);
  
  // Track which dropdowns are open
  const [openMoods, setOpenMoods] = useState<Record<string, boolean>>({
    CHILL: true,
    HYPE: true,
  });

  const toggleMood = (mood: string) => {
    setOpenMoods(prev => ({ ...prev, [mood]: !prev[mood] }));
  };

  // Group pins by mood
  const groupedPins = useMemo(() => {
    const validPins = [...pins]
      .filter((p) => p && p.id && typeof p.latitude === 'number')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
    const groups: Record<string, Pin[]> = {};
    MOODS.forEach(m => groups[m] = []);
    
    validPins.forEach(pin => {
      if (groups[pin.mood]) groups[pin.mood].push(pin);
    });
    
    return groups;
  }, [pins]);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 mb-4 mt-2">
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800">
          Live Mood Feed
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {MOODS.map(mood => {
          const groupPins = groupedPins[mood];
          const isOpen = openMoods[mood];
          const { label, bg, text } = getMoodColor(mood);
          
          if (groupPins.length === 0) return null; // Hide empty categories

          return (
            <div key={mood} className="flex flex-col gap-1.5">
              {/* Dropdown Header */}
              <button 
                onClick={() => toggleMood(mood)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-sm",
                  "border border-gray-100 hover:border-gray-200"
                )}
                style={{ backgroundColor: bg }}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold tracking-wide uppercase", text)}>{label}</span>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/60", text)}>
                    {groupPins.length}
                  </span>
                </div>
                {isOpen ? <ChevronDown className="size-4 opacity-50" /> : <ChevronRight className="size-4 opacity-50" />}
              </button>

              {/* Dropdown Content */}
              {isOpen && (
                <div className="flex flex-col gap-2 mt-1 pl-1 border-l-2 border-gray-100/50">
                  {groupPins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => onPinClick(pin)}
                      className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md text-left ml-2"
                    >
                      <div className="flex items-start justify-between">
                         <span className="text-xs font-medium text-gray-800 line-clamp-1">
                           <PinLocationName pin={pin} />
                         </span>
                        <div className="flex items-center gap-1 mt-0.5 text-gray-400 shrink-0">
                          <Clock className="size-3" />
                          <span className="text-[9px] font-medium tracking-wide uppercase">
                            {timeAgo(pin.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between border-t border-gray-50 pt-1.5 px-0.5">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="size-3" />
                          <span className="text-[10px] font-mono tracking-tighter">
                            {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50/80 px-1.5 py-0.5 rounded px-1.5">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            pin.credibilityScore >= 0.5 ? "bg-emerald-400" : "bg-amber-400"
                          )} />
                          <span className="text-[9px] font-semibold text-gray-600">
                            {Math.round(pin.credibilityScore * 100)}% Trust
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {Object.values(groupedPins).every(arr => arr.length === 0) && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center mt-2">
          <MapPin className="mx-auto mb-2 size-6 text-gray-300" />
          <p className="text-xs font-medium text-gray-500">No moods dropped yet</p>
          <p className="mt-1 text-[10px] text-gray-400">Click the map to drop a pin!</p>
        </div>
      )}
    </div>
  );
};
