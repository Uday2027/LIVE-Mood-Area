// src/components/Panel/PinDetail.tsx
// Shown in a bottom sheet when user clicks a pin on the map.
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Navigation } from 'lucide-react';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { CredibilityBar } from '@/components/UI/CredibilityBar';
import { votePin, deletePin } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';
import { formatRelativeTime } from '@/utils/formatters';
import { getSessionId } from '@/utils/session';
import type { Pin } from '@/api/pins';

type Props = {
  pin: Pin;
  onClose: () => void;
  onRouteFound: (coords: [number, number][]) => void;
};

export const PinDetail = ({ pin, onClose, onRouteFound }: Props) => {
  const [voting,  setVoting]  = useState(false);
  const [voted,   setVoted]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const updateCredib = usePinStore((s) => s.updateCredibility);
  const removeStoredPin = usePinStore((s) => s.removePin);

  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const isOwner = pin.sessionId === getSessionId();

  const handleVote = async (vote: 'CONFIRM' | 'DISPUTE') => {
    if (voted) return;
    setVoting(true);
    setError(null);
    try {
      const { credibilityScore } = await votePin(pin.id, vote);
      updateCredib(pin.id, credibilityScore);
      setVoted(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this pin?')) return;
    try {
      await deletePin(pin.id);
      removeStoredPin(pin.id);
      onClose();
    } catch {
      setError('Failed to delete pin');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between">
        <MoodBadge mood={pin.mood} className="text-sm" />
        <div className="flex gap-2">
          {isOwner && (
            <button onClick={handleDelete} className="rounded-full p-1.5 text-red-400 hover:bg-red-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          )}
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>
      </div>

      {pin.message && (
        <p className="text-sm text-gray-700 leading-relaxed">{pin.message}</p>
      )}

      <div className="space-y-1 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Credibility</span>
          <span>{formatRelativeTime(pin.createdAt)}</span>
        </div>
        <CredibilityBar score={pin.credibilityScore} />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={async () => {
            setRouteLoading(true);
            setRouteError(null);
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                try {
                  const url = `http://router.project-osrm.org/route/v1/driving/${pos.coords.longitude},${pos.coords.latitude};${pin.longitude},${pin.latitude}?geometries=geojson`;
                  const res = await fetch(url);
                  if (!res.ok) throw new Error('API failed');
                  const data = await res.json();
                  if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('No route');
                  // OSRM geom = [lng, lat], Leaflet needs [lat, lng]
                  const geom = data.routes[0].geometry.coordinates;
                  onRouteFound(geom.map((coord: number[]) => [coord[1], coord[0]]));
                } catch {
                  setRouteError('Failed to calculate route.');
                } finally {
                  setRouteLoading(false);
                }
              },
              () => {
                setRouteError('Location access required for directions.');
                setRouteLoading(false);
              }
            );
          }}
          disabled={routeLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {routeLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Navigation className="size-4" />
          )}
          {routeLoading ? 'Calculating...' : 'Get Directions'}
        </button>
        {routeError && <span className="text-xs text-red-500 text-center font-medium">{routeError}</span>}
      </div>

      {!voted ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote('CONFIRM')}
            disabled={voting}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <ThumbsUp className="size-4" /> Confirm
          </button>
          <button
            onClick={() => handleVote('DISPUTE')}
            disabled={voting}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <ThumbsDown className="size-4" /> Dispute
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">Thanks for your vote!</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
