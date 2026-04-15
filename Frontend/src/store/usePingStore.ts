// src/store/usePingStore.ts
import { create } from 'zustand';
import type { PingType } from '@/components/Social/ProximityPing';

type PingState = {
  activePings: PingType[];
  addPing: (ping: PingType) => void;
  removePing: (pingId: string) => void;
};

export const usePingStore = create<PingState>((set) => ({
  activePings: [],
  addPing: (ping) => set((state) => ({ activePings: [...state.activePings, ping] })),
  removePing: (pingId) => set((state) => ({ activePings: state.activePings.filter(p => p.id !== pingId) }))
}));
