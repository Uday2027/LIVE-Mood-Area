// src/components/PinForm/PinForm.tsx
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Camera, X } from 'lucide-react';
import { MoodSelector } from './MoodSelector';
import { useLocation } from '@/hooks/useLocation';
import { createPin, votePin, type Pin } from '@/api/pins';
import { usePinStore } from '@/store/usePinStore';
import type { Mood } from '@/utils/moodColors';
import { getMoodColor } from '@/utils/moodColors';
import toast from 'react-hot-toast';

type Props = { 
  onClose: () => void;
  selectedCoords?: { lat: number, lng: number } | null;
  onGpsSuccess?: (lat: number, lng: number) => void;
};

export const PinForm = ({ onClose, selectedCoords, onGpsSuccess }: Props) => {
  const [mood,    setMood]    = useState<Mood | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [collidedPin, setCollidedPin] = useState<Pin | null>(null);
  
  const { coords: gpsCoords, requesting, error: locError, requestLocation } = useLocation();
  const addPin = usePinStore((s) => s.addPin);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gpsCoords && onGpsSuccess) {
      onGpsSuccess(gpsCoords.lat, gpsCoords.lng);
    }
  }, [gpsCoords, onGpsSuccess]);

  const finalCoords = selectedCoords || gpsCoords;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitPin = async (ignoreCollision = false) => {
    if (!mood) { setError('Please select a mood'); return; }
    if (!message.trim()) { setError('Please add a short description'); return; }
    if (!imageBase64) { setError('Please take a live photo'); return; }
    if (!finalCoords) { 
      setError('Please click the map or enable GPS to select a location.');
      return; 
    }

    setLoading(true);
    setError(null);
    setCollidedPin(null);
    
    try {
      const pin = await createPin({
        mood,
        message: message.trim(),
        imageUrl: imageBase64,
        latitude:  finalCoords.lat,
        longitude: finalCoords.lng,
        ignoreCollision,
      });
      addPin(pin);
      onClose();
    } catch (err: unknown) {
      // Axios interceptor returns err.response.data.error — already a parsed object for 409
      const errPayload = err as { collidedPin?: Pin; message?: string } | string;
      
      if (typeof errPayload === 'object' && errPayload !== null && 'collidedPin' in errPayload && errPayload.collidedPin) {
        setCollidedPin(errPayload.collidedPin);
        return;
      }
      
      const msg = typeof errPayload === 'string'
        ? errPayload
        : (errPayload as { message?: string }).message ?? 'Failed to drop pin';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPin(false);
  };

  const handleUpvoteCollided = async () => {
    if (!collidedPin) return;
    setLoading(true);
    try {
      await votePin(collidedPin.id, 'CONFIRM');
      toast.success('Pin duration extended by 30 mins!');
      onClose();
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err as { message?: string })?.message ?? 'Failed to upvote';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (collidedPin) {
    const colColor = getMoodColor(collidedPin.mood);
    return (
      <div className="flex flex-col items-center text-center gap-4 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: colColor.bg, borderColor: colColor.border, borderWidth: 4 }}>
          <span className="text-3xl">{colColor.emoji}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Wait a second!</h3>
        <p className="text-sm text-gray-500">
          Someone already dropped a <strong style={{ color: colColor.text }}>{colColor.label}</strong> pin right here within 50 meters.
        </p>
        <p className="text-sm italic text-gray-400">"{collidedPin.message}"</p>
        
        <div className="mt-4 flex w-full flex-col gap-2">
          <button 
            type="button" 
            onClick={handleUpvoteCollided} 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-blue-700"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <span>👍</span>} Upvote to Extend Duration
          </button>
          <button 
            type="button" 
            onClick={() => submitPin(true)}
            disabled={loading}
            className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200"
          >
            Drop Mine Anyway
          </button>
          <button 
            type="button" 
            onClick={() => setCollidedPin(null)}
            className="w-full px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500 mb-2 pb-2 border-b border-gray-100 flex-1">
          Share the current vibe of this area. A live photo is required.
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
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          rows={2}
          required
          placeholder="What's happening right now?"
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600 uppercase tracking-wide">
          Live Photo <span className="text-red-500">*</span>
        </label>
        {!imageBase64 ? (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors"
           >
              <Camera className="size-8 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-600">Snap a Photo</span>
              <span className="text-xs text-gray-400 text-center mt-1">Must be taken from camera</span>
           </div>
        ) : (
           <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm group">
              <img src={imageBase64} alt="Captured preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setImageBase64(null)} 
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-4" />
              </button>
           </div>
        )}
        {/* Hidden File Input for Camera */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          className="hidden" 
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
            Location secure
          </div>
          {selectedCoords && <span className="text-emerald-500 font-normal">Custom Drop</span>}
        </div>
      )}

      {(error ?? locError) && (
        <div className="rounded-md bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium whitespace-pre-line">
          {error ?? locError}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !mood || !message || !imageBase64 || (!finalCoords && requesting)}
          className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {loading || requesting ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          {requesting ? 'Locating...' : 'Drop Pin'}
        </button>
      </div>
    </form>
  );
};
