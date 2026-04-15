// src/hooks/useCircle.ts
import { useState, useCallback } from 'react';
import { useCircleStore } from '@/store/useCircleStore';
import { joinCircle, leaveCircle, getCircleMessages } from '@/api/circles';

export const useCircle = (circleId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setCircle = useCircleStore((s) => s.setCircle);
  const setMessages = useCircleStore((s) => s.setMessages);
  const clearCircle = useCircleStore((s) => s.clearCircle);

  const join = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await joinCircle(circleId);
      setCircle(result.circle);
      setMessages(result.messages);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to join circle');
    } finally {
      setLoading(false);
    }
  }, [circleId, setCircle, setMessages]);

  const leave = useCallback(async () => {
    try {
      await leaveCircle(circleId);
      clearCircle();
    } catch (err) {
      console.error('Failed to leave circle:', err);
    }
  }, [circleId, clearCircle]);

  const loadMoreMessages = useCallback(async (before: string) => {
    try {
      const msgs = await getCircleMessages(circleId, 50, before);
      // Logic to prepend messages could be added to store
      return msgs; 
    } catch (err) {
      console.error('Failed to load older messages:', err);
      return [];
    }
  }, [circleId]);

  return { join, leave, loadMoreMessages, loading, error };
};
