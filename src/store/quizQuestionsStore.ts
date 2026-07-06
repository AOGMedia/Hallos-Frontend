import { create } from 'zustand';
import { QuizQuestion, QuizCategory } from '@/services/quizAdminService';

interface QuizQuestionsState {
  // Data
  questions: QuizQuestion[];
  categories: QuizCategory[];
  loading: boolean;

  // Filters
  selectedCategory: string;
  selectedDifficulty: string;

  // Modal states
  isUploadModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isQuestionModalOpen: boolean;
  editingQuestion: QuizQuestion | null;

  // Actions
  setQuestions: (questions: QuizQuestion[]) => void;
  setCategories: (categories: QuizCategory[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setUploadModalOpen: (open: boolean) => void;
  setCategoryModalOpen: (open: boolean) => void;
  setQuestionModalOpen: (open: boolean) => void;
  setEditingQuestion: (question: QuizQuestion | null) => void;
  removeQuestion: (id: string) => void;
}

export const useQuizQuestionsStore = create<QuizQuestionsState>((set) => ({
  questions: [],
  categories: [],
  loading: true,
  selectedCategory: '',
  selectedDifficulty: '',
  isUploadModalOpen: false,
  isCategoryModalOpen: false,
  isQuestionModalOpen: false,
  editingQuestion: null,

  setQuestions: (questions) => set({ questions }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setUploadModalOpen: (isUploadModalOpen) => set({ isUploadModalOpen }),
  setCategoryModalOpen: (isCategoryModalOpen) => set({ isCategoryModalOpen }),
  setQuestionModalOpen: (isQuestionModalOpen) => set({ isQuestionModalOpen }),
  setEditingQuestion: (editingQuestion) => set({ editingQuestion }),
  removeQuestion: (id) => set((state) => ({ questions: state.questions.filter((q) => q.id !== id) })),
}));
