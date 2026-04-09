// src/hooks/useSocket.ts
// Connects to Socket.io server and wires live events to Zustand stores.
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { usePinStore } from '@/store/usePinStore';
import type { Pin } from '@/api/pins';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

export const useSocket = (): void => {
  const socketRef      = useRef<Socket | null>(null);
  const addPin         = usePinStore((s) => s.addPin);
  const removePin      = usePinStore((s) => s.removePin);
  const updateCredib   = usePinStore((s) => s.updateCredibility);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('new_pin',   ({ pin }: { pin: Pin })                      => addPin(pin));
    socket.on('pin_expired', ({ pinId }: { pinId: string })             => removePin(pinId));
    socket.on('pin_removed', ({ pinId }: { pinId: string })             => removePin(pinId));
    socket.on('pin_credibility_update', ({ pinId, credibilityScore }: { pinId: string; credibilityScore: number }) =>
      updateCredib(pinId, credibilityScore),
    );

    return () => { socket.disconnect(); };
  }, [addPin, removePin, updateCredib]);
};
