// src/components/Panel/MyPinsHistory.tsx
// Shows the current session's previously dropped pins as a history drawer.
import { MapPin, Clock, Trash2, X, History } from 'lucide-react';
import { usePinStore } from '@/store/usePinStore';
import { deletePin } from '@/api/pins';
import { getMoodColor } from '@/utils/moodColors';
import { cn } from '@/lib/utils';
import type { Pin } from '@/api/pins';
import toast from 'react-hot-toast';

const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
};

const timeUntil = (dateStr: string) => {
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `Expires in ${m}m`;
  return `Expires in ${Math.floor(m / 60)}h`;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPinClick: (pin: Pin) => void;
};

export const MyPinsHistory = ({ open, onClose, onPinClick }: Props) => {
  const myPins    = usePinStore((s) => s.myPins);
  const removePin = usePinStore((s) => s.removePin);

  const handleDelete = async (pin: Pin) => {
    try {
      await deletePin(pin.id);
      removePin(pin.id);
      toast.success('Pin removed');
    } catch {
      toast.error('Could not remove pin');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[1005] bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer — slides up from bottom on mobile, panel on desktop */}
      <div
        className={cn(
          'fixed z-[1010] bg-white shadow-2xl transition-all duration-300 ease-out',
          // Mobile: bottom sheet
          'bottom-0 inset-x-0 rounded-t-3xl max-h-[75vh]',
          // Desktop: right side panel
          'md:bottom-24 md:right-6 md:inset-x-auto md:w-96 md:rounded-2xl md:max-h-[65vh]',
          open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
          'md:transition-all',
          open ? 'md:scale-100 md:opacity-100' : 'md:scale-95 md:opacity-0 md:pointer-events-none md:translate-y-0'
        )}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="size-4 text-blue-500" />
            <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">My Pin History</span>
            {myPins.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                {myPins.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 80px)' }}>
          {myPins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <MapPin className="size-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No pins dropped yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Tap the <span className="font-bold text-blue-500">+</span> button on the map to drop your first mood pin!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 px-2 py-2">
              {myPins.map((pin) => {
                const color = getMoodColor(pin.mood);
                return (
                  <div key={pin.id} className="group flex items-start gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                    {/* Mood dot */}
                    <button
                      onClick={() => { onPinClick(pin); onClose(); }}
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-transform hover:scale-110"
                      style={{ backgroundColor: color.bg }}
                      title="Focus on map"
                    >
                      {color.emoji}
                    </button>

                    {/* Details */}
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => { onPinClick(pin); onClose(); }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: color.text }}
                        >
                          {color.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{timeAgo(pin.createdAt)}</span>
                      </div>
                      {pin.message && (
                        <p className="mt-0.5 text-sm text-gray-700 line-clamp-1">{pin.message}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="size-2.5" />
                          {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {timeUntil(pin.expiresAt)}
                        </span>
                        <span className="ml-auto font-semibold text-emerald-600">
                          {Math.round(pin.credibilityScore * 100)}% trust
                        </span>
                      </div>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(pin)}
                      className="mt-1 shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      title="Remove pin"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
