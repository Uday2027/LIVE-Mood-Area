import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Flame, Users } from 'lucide-react';
import { MOOD_COLORS } from '@/utils/moodColors';

const eventIcon = (mood: string) => {
  const color = MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.CHILL;
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-16 w-16 rounded-full animate-ping opacity-20" style="background-color: ${color.bg}"></div>
        <div class="absolute h-10 w-10 rounded-full animate-pulse opacity-40" style="background-color: ${color.bg}"></div>
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-white shadow-xl border-2" style="background-color: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const SpontaneousEventMarker = ({ event }: { event: any }) => {
  return (
    <Marker 
      position={[event.latitude, event.longitude]} 
      icon={eventIcon(event.mood)}
    >
      <Popup className="mood-popup">
        <div className="p-1 text-center min-w-[160px]">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Cluster</span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Spontaneous {event.mood} Vibe
          </h3>
          <p className="text-[10px] text-slate-400 mb-3 leading-tight">
            Multiple people are feeling this way right here!
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-bold">{event.pinCount}+ Pins</span>
            </div>
          </div>
          <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-[11px] font-black text-white shadow-lg transition-transform active:scale-95">
            JOIN THE CIRCLE
          </button>
        </div>
      </Popup>
    </Marker>
  );
};
