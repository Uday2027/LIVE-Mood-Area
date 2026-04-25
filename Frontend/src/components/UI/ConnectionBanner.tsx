import { useConnectionStore } from '@/store/useConnectionStore';
import { WifiOff } from 'lucide-react';

export const ConnectionBanner = () => {
  const isConnected = useConnectionStore((s) => s.isConnected);

  if (isConnected) return null;

  return (
    <div className="fixed top-0 z-50 w-full bg-red-500/90 py-1.5 px-4 text-center text-xs font-semibold text-white shadow-md backdrop-blur-md flex items-center justify-center gap-2 transition-all duration-300">
      <WifiOff className="size-3.5" />
      Reconnecting to live map...
    </div>
  );
};
