import { create } from 'zustand';
import { QuizTournament } from '@/services/quizAdminService';

interface QuizTournamentsState {
  // Data
  tournaments: QuizTournament[];
  loading: boolean;

  // Modal states
  isModalOpen: boolean;
  editingTournament: QuizTournament | null;

  // Actions
  setTournaments: (tournaments: QuizTournament[]) => void;
  setLoading: (loading: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  setEditingTournament: (tournament: QuizTournament | null) => void;
}

export const useQuizTournamentsStore = create<QuizTournamentsState>((set) => ({
  tournaments: [],
  loading: true,
  isModalOpen: false,
  editingTournament: null,

  setTournaments: (tournaments) => set({ tournaments }),
  setLoading: (loading) => set({ loading }),
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
  setEditingTournament: (editingTournament) => set({ editingTournament }),
}));
