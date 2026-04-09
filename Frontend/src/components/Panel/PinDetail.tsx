// src/components/Panel/PinDetail.tsx
// Shown in a bottom sheet when user clicks a pin on the map.
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { MoodBadge } from '@/components/UI/MoodBadge';
import { CredibilityBar } from '@/components/UI/CredibilityBar';
import { votePin } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';
import { formatRelativeTime } from '@/utils/formatters';
import type { Pin } from '@/api/pins';

type Props = {
  pin: Pin;
  onClose: () => void;
};

export const PinDetail = ({ pin, onClose }: Props) => {
  const [voting,  setVoting]  = useState(false);
  const [voted,   setVoted]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const updateCredib = usePinStore((s) => s.updateCredibility);

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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between">
        <MoodBadge mood={pin.mood} className="text-sm" />
        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
          <X className="size-4 text-gray-500" />
        </button>
      </div>

      {pin.message && (
        <p className="text-sm text-gray-700 leading-relaxed">{pin.message}</p>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Credibility</span>
          <span>{formatRelativeTime(pin.createdAt)}</span>
        </div>
        <CredibilityBar score={pin.credibilityScore} />
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
