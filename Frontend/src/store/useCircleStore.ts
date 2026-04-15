// src/store/useCircleStore.ts
import { create } from 'zustand';
import type { Circle, CircleMessage } from '@/api/circles';

type CircleState = {
  activeCircle: Circle | null;
  messages: CircleMessage[];
  memberCount: number;

  setCircle: (circle: Circle | null) => void;
  addMessage: (message: CircleMessage) => void;
  setMessages: (messages: CircleMessage[]) => void;
  setMemberCount: (count: number) => void;
  clearCircle: () => void;
};

export const useCircleStore = create<CircleState>((set) => ({
  activeCircle: null,
  messages: [],
  memberCount: 0,

  setCircle: (circle) => set({ activeCircle: circle, memberCount: circle?.memberCount || 0 }),
  
  addMessage: (message) => set((state) => {
    // Avoid duplicate messages
    if (state.messages.some((m) => m.id === message.id)) return state;
    return { messages: [...state.messages, message] };
  }),
  
  setMessages: (messages) => set({ messages }),
  
  setMemberCount: (count) => set({ memberCount: count }),
  
  clearCircle: () => set({ activeCircle: null, messages: [], memberCount: 0 })
}));
