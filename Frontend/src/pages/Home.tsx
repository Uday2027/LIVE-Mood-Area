// src/pages/Home.tsx
// Main map page — renders MapView, PinForm drawer, NeighborhoodPanel, and wires socket.
import { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { MapView } from '@/components/Map/Map';
import { PinForm } from '@/components/PinForm/PinForm';
import { PinDetail } from '@/components/Panel/PinDetail';
import { NeighborhoodPanel } from '@/components/Panel/NeighborhoodPanel';
import { NearbyCount } from '@/components/Social/NearbyCount';
import { VibeMatch } from '@/components/Social/VibeMatch';
import { ProximityPing } from '@/components/Social/ProximityPing';
import { QuestBanner } from '@/components/Gamification/QuestBanner';
import { useSocket } from '@/hooks/useSocket';
import { useNearby } from '@/hooks/useNearby';
import { usePins } from '@/hooks/usePins';
import { usePingStore } from '@/store/usePingStore';
import type { Pin } from '@/api/pins';

export default function Home() {
  useSocket();                     // establish real-time connection
  const { loading } = usePins();   // load active pins on mount
  useNearby();                     // start polling nearby matches

  const [showForm,    setShowForm]    = useState(false);
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [draftCoords, setDraftCoords] = useState<{lat: number, lng: number} | null>(null);
  const [activeRoute, setActiveRoute] = useState<[number, number][] | null>(null);

  const { activePings, removePing } = usePingStore();

  const handlePinClick = useCallback((pin: Pin) => {
    setSelectedPin(pin);
    setShowForm(false);
    setDraftCoords(null);
    setActiveRoute(null);
  }, []);

  const handleFormOpen = () => {
    setSelectedPin(null);
    setShowForm(true);
    setDraftCoords(null); // start fresh
    setActiveRoute(null);
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (showForm) {
      setDraftCoords({ lat, lng });
    }
    setActiveRoute(null);
  }, [showForm]);

  const handleGpsSuccess = useCallback((lat: number, lng: number) => {
    setDraftCoords({ lat, lng });
  }, []);

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left sidebar — neighborhoods */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/30 lg:block">
        <NeighborhoodPanel onPinClick={handlePinClick} />
      </aside>

      {/* Map fills remaining space */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}
        <MapView 
          onPinClick={handlePinClick} 
          onMapClick={handleMapClick} 
          draftCoords={draftCoords} 
          focusCoords={selectedPin ? { lat: selectedPin.latitude, lng: selectedPin.longitude } : draftCoords}
          activeRoute={activeRoute}
        />

        {/* FAB — drop pin */}
        <button
          onClick={handleFormOpen}
          className="absolute bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
          aria-label="Drop mood pin"
        >
          <Plus className="size-6" />
        </button>
      </div>

      {/* Floating Panel — PinForm */}
      {showForm && (
        <div className="absolute bottom-0 inset-x-0 md:bottom-24 md:right-6 md:inset-x-auto md:w-96 z-[1010] rounded-t-3xl md:rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden transition-all">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 bg-gray-50/50">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Drop Mood Pin</span>
            <button onClick={() => setShowForm(false)} className="rounded-full p-1 hover:bg-gray-200 transition-colors">
              <X className="size-5 text-gray-500" />
            </button>
          </div>
          <PinForm 
            onClose={() => setShowForm(false)} 
            selectedCoords={draftCoords} 
            onGpsSuccess={handleGpsSuccess}
          />
        </div>
      )}

      {/* Floating Panel — PinDetail */}
      {selectedPin && (
        <div className="absolute bottom-0 inset-x-0 md:bottom-24 md:right-6 md:inset-x-auto md:w-96 z-[1010] rounded-t-3xl md:rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden transition-all">
          <div className="flex items-center justify-end px-4 pt-3 absolute right-0 top-0 z-10">
            <button onClick={() => setSelectedPin(null)} className="rounded-full bg-white/80 backdrop-blur-sm p-1.5 shadow-sm hover:bg-gray-100 transition-colors">
              <X className="size-4 text-gray-600" />
            </button>
          </div>
          <PinDetail 
            pin={selectedPin} 
            onClose={() => setSelectedPin(null)} 
            onRouteFound={setActiveRoute}
          />
        </div>
      )}

      <NearbyCount onOpenMatchPanel={() => setShowMatchPanel(true)} />
      <QuestBanner />
      
      {showMatchPanel && (
        <VibeMatch onClose={() => setShowMatchPanel(false)} />
      )}

      {/* Renders any incoming pings */}
      {activePings.map(ping => (
         <ProximityPing key={ping.id} ping={ping} onDismiss={() => removePing(ping.id)} />
      ))}
    </div>
  );
}
