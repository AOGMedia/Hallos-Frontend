import { create } from 'zustand';

type TournamentFormat = 'All Formats' | 'Battle Royale' | 'Speed Run' | 'Knockout' | 'Classic';

interface GamersState {
  activeFormat: TournamentFormat;
  setActiveFormat: (format: TournamentFormat) => void;
}

export const useGamersStore = create<GamersState>((set) => ({
  activeFormat: 'All Formats',
  setActiveFormat: (format) => set({ activeFormat: format }),
}));
