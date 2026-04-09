// src/store/usePinStore.ts
import { create } from 'zustand';
import type { Pin } from '@/api/pins';

type PinStore = {
  pins: Pin[];
  setPins: (pins: Pin[]) => void;
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
  updateCredibility: (id: string, score: number) => void;
};

export const usePinStore = create<PinStore>((set) => ({
  pins: [],
  setPins: (pins) => set({ pins }),
  addPin:  (pin)  => set((s) => ({ pins: [...s.pins, pin] })),
  removePin: (id) => set((s) => ({ pins: s.pins.filter((p) => p.id !== id) })),
  updateCredibility: (id, score) =>
    set((s) => ({
      pins: s.pins.map((p) => (p.id === id ? { ...p, credibilityScore: score } : p)),
    })),
}));
