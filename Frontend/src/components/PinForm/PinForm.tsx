// src/components/PinForm/PinForm.tsx
import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { MoodSelector } from './MoodSelector';
import { useLocation } from '@/hooks/useLocation';
import { createPin } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';
import type { Mood } from '@/utils/moodColors';

type Props = { 
  onClose: () => void;
  selectedCoords?: { lat: number, lng: number } | null;
};

export const PinForm = ({ onClose, selectedCoords }: Props) => {
  const [mood,    setMood]    = useState<Mood | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const { coords: gpsCoords, requesting, error: locError, requestLocation } = useLocation();
  const addPin = usePinStore((s) => s.addPin);

  const finalCoords = selectedCoords || gpsCoords;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) { setError('Please select a mood'); return; }
    if (!finalCoords) { 
      setError('Please click the map or enable GPS to select a location.');
      return; 
    }

    setLoading(true);
    setError(null);
    try {
      const pin = await createPin({
        mood,
        message: message.trim() || undefined,
        latitude:  finalCoords.lat,
        longitude: finalCoords.lng,
      });
      addPin(pin);
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to drop pin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          Share the current mood of this area. Your physical location will be attached automatically.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600 uppercase tracking-wide">
          How's the vibe?
        </label>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600 uppercase tracking-wide">
          Message <span className="normal-case text-gray-400">(optional · max 100 chars)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          rows={2}
          placeholder="What's happening here?"
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {!finalCoords && !requesting && !error && !locError && (
        <div className="rounded-lg bg-blue-50/50 p-4 border border-blue-100">
          <p className="text-sm text-blue-800 font-medium mb-2">Location Required</p>
          <p className="text-xs text-blue-600 mb-3">Click anywhere on the map to set a location, or use your GPS.</p>
          <button
            type="button"
            onClick={requestLocation}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-blue-200 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm font-medium"
          >
            <MapPin className="size-4" />
            Enable GPS
          </button>
        </div>
      )}

      {finalCoords && (
        <div className="flex items-center justify-between text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-md transition-all">
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5" />
            Location selected
          </div>
          {selectedCoords && <span className="text-emerald-500 font-normal">Custom Drop</span>}
        </div>
      )}

      {(error ?? locError) && (
        <div className="rounded-md bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium">
          {error ?? locError}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !mood || (!finalCoords && requesting)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {loading || requesting ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          {requesting ? 'Locating...' : 'Drop Pin'}
        </button>
      </div>
    </form>
  );
};
