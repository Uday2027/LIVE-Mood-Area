// src/components/Social/VibeMatch.tsx
import { useState, useEffect } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { getMoodColor } from '@/utils/moodColors';
import { X, UserPlus, Heart, Compass, Loader2 } from 'lucide-react';
import api from '@/api/client';
import toast from 'react-hot-toast';

type Props = {
  onClose: () => void;
};

export const VibeMatch = ({ onClose }: Props) => {
  const { nearbyCount, nearbyMoods, pendingMatches } = useMatchStore();
  const [isSearching, setIsSearching] = useState(false);
  
  // Timer state for pending match
  const [timeLeft, setTimeLeft] = useState(30);

  const activeMatch = pendingMatches[0];

  useEffect(() => {
    if (!activeMatch) {
        setTimeLeft(30);
        return;
    }
    
    // Check if expired based on DB expires_at
    const expiresAt = new Date(activeMatch.expiresAt).getTime();
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);
      if (remaining <= 0) {
         setTimeLeft(0);
         useMatchStore.getState().removeMatch(activeMatch.id);
      } else {
         setTimeLeft(remaining);
      }
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [activeMatch]);

  const handleConnect = async () => {
    if (!activeMatch) return;
    try {
      await api.post(`/matches/${activeMatch.id}/accept`);
      // The socket event will handle the navigation to the circle
    } catch (err) {
      toast.error('Failed to accept match. It may have expired.');
      useMatchStore.getState().removeMatch(activeMatch.id);
    }
  };

  const handlePass = async () => {
    if (!activeMatch) return;
    try {
      await api.post(`/matches/${activeMatch.id}/decline`);
      useMatchStore.getState().removeMatch(activeMatch.id);
    } catch (err) {
      useMatchStore.getState().removeMatch(activeMatch.id);
    }
  };

  const handleFindTribe = () => {
    setIsSearching(true);
    // Vibe match occurs via the backend background job every 60s.
    // By clicking this, we just visually show they are waiting.
    toast.success('Looking for your tribe... Make sure you have dropped a mood pin recently!');
  };

  // If there's an active pending match, show the match card
  if (activeMatch) {
    const theirMoodColor = getMoodColor(activeMatch.initiatorMood === activeMatch.targetMood ? activeMatch.initiatorMood : activeMatch.initiatorMood); 

    return (
      <div className="fixed inset-x-0 bottom-0 z-[500] flex animate-in slide-in-from-bottom p-4 sm:items-center sm:justify-center sm:p-0 sm:bg-black/20 sm:inset-0 sm:backdrop-blur-sm">
        <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl sm:relative border border-gray-100">
           <div className="flex flex-col items-center justify-center text-center">
             <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ backgroundColor: theirMoodColor.bg }}></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-xl text-4xl" style={{ borderColor: theirMoodColor.border, backgroundColor: theirMoodColor.bg }}>
                   {theirMoodColor.emoji}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-bold shadow-sm whitespace-nowrap">
                   ~{activeMatch.distanceMeters}m away
                </div>
             </div>

             <h3 className="mb-2 text-2xl font-black text-gray-900">Vibe Match!</h3>
             <p className="mb-6 text-sm text-gray-500">
               Someone nearby shares your <span style={{ color: theirMoodColor.text }} className="font-bold">{theirMoodColor.label}</span> mood.
             </p>

             <div className="w-full mb-6">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                   <span>Time to connect</span>
                   <span className={timeLeft <= 10 ? "text-red-500" : ""}>0:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div 
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000 linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
             </div>

             <div className="flex w-full gap-3">
               <button 
                 onClick={handlePass}
                 className="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
               >
                 Pass
               </button>
               <button 
                 onClick={handleConnect}
                 className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg"
               >
                 <Heart className="size-5" /> Connect
               </button>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // Standard Bottom Sheet
  return (
    <div className="fixed inset-x-0 bottom-0 z-[500] flex animate-in slide-in-from-bottom flex-col rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl border border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
           <Compass className="size-5 text-indigo-500" />
           Live Vibe Radar
        </h2>
        <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-baseline gap-2">
          <span className="text-4xl font-black text-gray-900">{nearbyCount}</span>
          <span className="font-medium text-gray-500">people around you</span>
        </div>

        <div className="mb-8 space-y-3">
           <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Distribution</h4>
           <div className="flex flex-col gap-2">
             {nearbyMoods.map(({ mood, count }) => {
               const percentage = nearbyCount > 0 ? (count / nearbyCount) * 100 : 0;
               return (
                 <div key={mood} className="flex items-center gap-3">
                   <div className="w-24 shrink-0">
                     <MoodBadge mood={mood} size="sm" />
                   </div>
                   <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                     <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: getMoodColor(mood).text }}></div>
                   </div>
                   <span className="w-6 text-right text-xs font-bold text-gray-600">{count}</span>
                 </div>
               );
             })}
           </div>
        </div>

        <button 
          onClick={handleFindTribe}
          disabled={isSearching}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:bg-gray-400 disabled:shadow-none"
        >
          {isSearching ? <Loader2 className="size-5 animate-spin"/> : <UserPlus className="size-5" />}
          {isSearching ? 'Scanning frequency...' : 'Find My Vibe Tribe'}
        </button>
        
        <p className="mt-4 text-center text-xs text-gray-400">
          We'll automatically match you with nearby people in the same mood as your recent pin.
        </p>
      </div>
    </div>
  );
};
