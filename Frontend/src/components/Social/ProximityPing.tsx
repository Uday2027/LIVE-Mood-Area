// src/components/Social/ProximityPing.tsx
import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { getMoodColor, type Mood } from '@/utils/moodColors';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { useLocation } from '@/hooks/useLocation';

export type PingType = {
  id: string;
  senderSession: string;
  mood: Mood;
};

type Props = {
  ping: PingType;
  onDismiss: () => void;
};

export const ProximityPing = ({ ping, onDismiss }: Props) => {
  const [visible, setVisible] = useState(true);
  const color = getMoodColor(ping.mood);
  const { coords } = useLocation();

  useEffect(() => {
    // Auto dismiss after 15 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = async () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Wait for transition
    try {
      await api.post(`/pings/${ping.id}/seen`);
    } catch (e) {
      // Background action, ignore error
    }
  };

  const handlePingBack = async () => {
    if (!coords) {
       toast.error('Location needed to ping back');
       return;
    }
    
    try {
      await api.post('/pings', {
        receiverSession: ping.senderSession,
        mood: ping.mood, // Send same mood back
        latitude: coords.lat,
        longitude: coords.lng
      });
      toast.success('Pinged back!');
      handleDismiss();
    } catch (err) {
      toast.error('Failed to ping back. It may have expired.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 z-[600] flex w-[320px] -translate-x-1/2 animate-in slide-in-from-top fade-in flex-col gap-2 rounded-2xl border bg-white p-4 shadow-2xl transition-all duration-300" style={{ borderColor: color.border }}>
      <button onClick={handleDismiss} className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100">
        <X className="size-4" />
      </button>
      
      <div className="flex items-center gap-3 pr-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl shadow-inner" style={{ backgroundColor: color.bg }}>
          {color.emoji}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">Vibe Ping Received</h4>
          <p className="text-xs font-medium text-gray-500">
            Someone nearby sent you a <span style={{ color: color.text }} className="font-bold">{color.label}</span> ping
          </p>
        </div>
      </div>

      <div className="mt-2 flex w-full gap-2">
        <button 
          onClick={handlePingBack}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
        >
          <Send className="size-3" /> Ping Back
        </button>
      </div>
    </div>
  );
};
