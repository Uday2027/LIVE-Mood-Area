// src/store/useMatchStore.ts
import { create } from 'zustand';
import type { Match } from '@/api/matches';
import type { Mood } from '@/utils/moodColors';

type MatchState = {
  nearbyCount: number;
  nearbyMoods: { mood: Mood; count: number }[];
  pendingMatches: Match[];
  activeMatch: Match | null;
  
  setNearbyCount: (count: number, moods: { mood: Mood; count: number }[]) => void;
  addMatch: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  setActiveMatch: (match: Match | null) => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  nearbyCount: 0,
  nearbyMoods: [],
  pendingMatches: [],
  activeMatch: null,

  setNearbyCount: (count, moods) => set({ nearbyCount: count, nearbyMoods: moods }),
  
  addMatch: (match) => set((state) => {
    if (state.pendingMatches.some((m) => m.id === match.id)) return state;
    return { pendingMatches: [...state.pendingMatches, match] };
  }),
  
  removeMatch: (matchId) => set((state) => ({
    pendingMatches: state.pendingMatches.filter((m) => m.id !== matchId),
    activeMatch: state.activeMatch?.id === matchId ? null : state.activeMatch
  })),
  
  setActiveMatch: (match) => set({ activeMatch: match })
}));
