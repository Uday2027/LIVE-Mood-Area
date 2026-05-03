// src/hooks/useSocket.ts
// Connects to Socket.io server and wires live events to Zustand stores.
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePinStore } from '@/store/usePinStore';
import { useCircleStore } from '@/store/useCircleStore';
import { useMatchStore } from '@/store/useMatchStore';
import type { Pin } from '@/api/pins';
import type { Match } from '@/api/matches';
import type { CircleMessage } from '@/api/circles';
import { usePingStore } from '@/store/usePingStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import type { PingType } from '@/components/Social/ProximityPing';
import { getSessionId } from '@/utils/session';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

export const useSocket = (): void => {
  const socketRef      = useRef<Socket | null>(null);
  const navigate       = useNavigate();

  const addPin         = usePinStore((s) => s.addPin);
  const removePin      = usePinStore((s) => s.removePin);
  const updateCredib   = usePinStore((s) => s.updateCredibility);
  
  const addMessage     = useCircleStore((s) => s.addMessage);
  const setMemberCount = useCircleStore((s) => s.setMemberCount);
  const clearCircle    = useCircleStore((s) => s.clearCircle);
  const activeCircle   = useCircleStore((s) => s.activeCircle);
  
  const addMatch       = useMatchStore((s) => s.addMatch);
  
  const addPing        = usePingStore((s) => s.addPing);
  const setConnected   = useConnectionStore((s) => s.setConnected);

  useEffect(() => {
    // Use getSessionId() — stored under 'moodmap_session_id', auto-generates if missing
    const sessionId = getSessionId();
    const socket = io(SOCKET_URL, { 
      transports: ['websocket'],
      auth: { sessionId }
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Pin Events
    socket.on('new_pin',   ({ pin }: { pin: Pin })                      => addPin(pin));
    socket.on('pin_expired', ({ pinId }: { pinId: string })             => removePin(pinId));
    socket.on('pin_removed', ({ pinId }: { pinId: string })             => removePin(pinId));
    socket.on('pin_credibility_update', ({ pinId, credibilityScore }: { pinId: string; credibilityScore: number }) =>
      updateCredib(pinId, credibilityScore),
    );

    // Neighborhood Events
    socket.on('mood_update', () => {
      // TODO: Update mood heatmap state (re-fetch or update store)
    });

    // Circle Events
    socket.on('new_circle', ({ circle }: any) => {
      toast(`New ${circle.mood} Circle formed nearby!`);
    });
    socket.on('circle_dissolved', ({ circleId }: { circleId: string }) => {
      if (activeCircle?.id === circleId) {
        toast('This circle has dissolved. The vibe has moved on.');
        clearCircle();
        navigate('/');
      }
    });
    socket.on('circle_message', (message: CircleMessage) => {
      addMessage(message);
    });
    socket.on('circle_member_count', ({ count }: { circleId: string, count: number }) => {
      setMemberCount(count);
    });

    // Match Events
    socket.on('vibe_match_found', ({ match }: { match: Match }) => {
      addMatch(match);
      toast.success('Vibe match found nearby!');
    });
    socket.on('match_accepted', ({ circleId }: { matchId: string, circleId: string }) => {
      toast.success('Match accepted!');
      navigate(`/circles/${circleId}`);
    });
    socket.on('match_declined', () => {
      toast('They passed on the match.');
    });

    // Interaction Events
    socket.on('proximity_ping', ({ ping }: { ping: PingType }) => {
      addPing(ping);
    });
    socket.on('badge_earned', ({ badge }: any) => {
      toast.success(`Badge Earned: ${badge.badge_type}!`);
    });

    return () => { socket.disconnect(); };
  }, [addPin, removePin, updateCredib, addMessage, setMemberCount, clearCircle, activeCircle, addMatch, addPing, navigate]);
};
