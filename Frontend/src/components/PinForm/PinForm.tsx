// src/components/PinForm/PinForm.tsx
import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { MoodSelector } from './MoodSelector';
import { useLocation } from '@/hooks/useLocation';
import { createPin } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';
import type { Mood } from '@/utils/moodColors';

type Props = { onClose: () => void };

export const PinForm = ({ onClose }: Props) => {
  const [mood,    setMood]    = useState<Mood | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const { coords, requesting, error: locError, requestLocation } = useLocation();
  const addPin = usePinStore((s) => s.addPin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) { setError('Please select a mood'); return; }
    if (!coords) { requestLocation(); return; }

    setLoading(true);
    setError(null);
    try {
      const pin = await createPin({
        mood,
        message: message.trim() || undefined,
        latitude:  coords.lat,
        longitude: coords.lng,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h2 className="text-base font-semibold text-gray-900">Drop a Mood Pin</h2>

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

      {!coords && (
        <button
          type="button"
          onClick={requestLocation}
          disabled={requesting}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 disabled:opacity-60"
        >
          <MapPin className="size-4" />
          {requesting ? 'Getting location…' : 'Use my current location'}
        </button>
      )}

      {(error ?? locError) && (
        <p className="text-xs text-red-500">{error ?? locError}</p>
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
          disabled={loading || !mood || (!coords && requesting)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Drop Pin
        </button>
      </div>
    </form>
  );
};
