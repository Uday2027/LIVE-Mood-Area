// src/store/usePinStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pin } from '@/api/pins';

type PinStore = {
  pins: Pin[];
  myPins: Pin[];          // persisted history of pins I created
  setPins: (pins: Pin[]) => void;
  addPin: (pin: Pin) => void;
  addMyPin: (pin: Pin) => void;  // call this when YOU create a pin
  removePin: (id: string) => void;
  updateCredibility: (id: string, score: number) => void;
};

export const usePinStore = create<PinStore>()(
  persist(
    (set) => ({
      pins:   [],
      myPins: [],
      setPins:  (pins) => set({ pins }),
      addPin:   (pin)  => set((s) => ({ pins: [...s.pins, pin] })),
      addMyPin: (pin)  => set((s) => ({
        myPins: [pin, ...s.myPins.filter((p) => p.id !== pin.id)],
      })),
      removePin: (id) => set((s) => ({
        pins:   s.pins.filter((p) => p.id !== id),
        myPins: s.myPins.filter((p) => p.id !== id),
      })),
      updateCredibility: (id, score) =>
        set((s) => ({
          pins: s.pins.map((p) => (p.id === id ? { ...p, credibilityScore: score } : p)),
          myPins: s.myPins.map((p) => (p.id === id ? { ...p, credibilityScore: score } : p)),
        })),
    }),
    {
      name: 'moodmap-my-pins',
      partialize: (state) => ({ myPins: state.myPins }), // only persist myPins, not global pins
    }
  )
);
