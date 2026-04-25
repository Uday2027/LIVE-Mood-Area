import { create } from 'zustand';

type ConnectionState = {
  isConnected: boolean;
  setConnected: (status: boolean) => void;
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: true,
  setConnected: (status) => set({ isConnected: status }),
}));
