// src/pages/Home.tsx
// Main map page — renders MapView, PinForm drawer, NeighborhoodPanel, and wires socket.
import { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { MapView } from '@/components/Map/Map';
import { PinForm } from '@/components/PinForm/PinForm';
import { PinDetail } from '@/components/Panel/PinDetail';
import { NeighborhoodPanel } from '@/components/Panel/NeighborhoodPanel';
import { useSocket } from '@/hooks/useSocket';
import { usePins } from '@/hooks/usePins';
import type { Pin } from '@/api/pins';

export default function Home() {
  useSocket();                     // establish real-time connection
  const { loading } = usePins();   // load active pins on mount

  const [showForm,    setShowForm]    = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const handlePinClick = useCallback((pin: Pin) => {
    setSelectedPin(pin);
    setShowForm(false);
  }, []);

  const handleFormOpen = () => {
    setSelectedPin(null);
    setShowForm(true);
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left sidebar — neighborhoods */}
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-gray-100 bg-white lg:block">
        <NeighborhoodPanel />
      </aside>

      {/* Map fills remaining space */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}
        <MapView onPinClick={handlePinClick} />

        {/* FAB — drop pin */}
        <button
          onClick={handleFormOpen}
          className="absolute bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
          aria-label="Drop mood pin"
        >
          <Plus className="size-6" />
        </button>
      </div>

      {/* Bottom drawer — PinForm */}
      {showForm && (
        <div className="absolute bottom-0 inset-x-0 z-30 rounded-t-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">New Pin</span>
            <button onClick={() => setShowForm(false)}>
              <X className="size-5 text-gray-400" />
            </button>
          </div>
          <PinForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Bottom drawer — PinDetail */}
      {selectedPin && (
        <div className="absolute bottom-0 inset-x-0 z-30 rounded-t-2xl bg-white shadow-2xl">
          <PinDetail pin={selectedPin} onClose={() => setSelectedPin(null)} />
        </div>
      )}
    </div>
  );
}
