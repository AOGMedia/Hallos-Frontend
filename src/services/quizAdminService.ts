import apiClient from '@/lib/api/client';

// --- Types ---

export interface QuizQuestionOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizQuestionOptions;
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface QuizTournament {
  id: string;
  name: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  prizePool: number;
  entryFee?: number;
  maxParticipants?: number;
  minParticipants?: number;
  createdAt: string;
  startTime?: string;
  registrationDeadline?: string;
}

export interface AdminDashboardStats {
  ongoingMatches: number;
  upcomingTournaments: number;
  revenueStats: {
    purchase: number;
    withdrawal: number;
  };
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  categoryId: string;
  entryFee?: number;
  maxParticipants?: number;
  minParticipants?: number;
  registrationDeadline?: string;
  startTime?: string;
  format?: string;
  prizeDistribution?: { first: number; second: number; third: number };
}

export interface UpdateTournamentData {
  name?: string;
  entryFee?: number;
  maxParticipants?: number;
}

export const quizAdminService = {
  // Get Categories
  getCategories: async () => {
    const response = await apiClient.get<{ success: boolean; categories: QuizCategory[] }>('/api/quiz/categories');
    return response.data;
  },

  // 23. Upload Questions
  uploadQuestions: async (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId);

    const response = await apiClient.post('/api/quiz/admin/questions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 24. Get Questions
  getQuestions: async (params: { categoryId: string; difficulty?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<{ success: boolean; questions: QuizQuestion[]; totalCount: number }>('/api/quiz/admin/questions', { params });
    return response.data;
  },

  // 25. Update Question
  updateQuestion: async (id: string, data: Partial<QuizQuestion>) => {
    const response = await apiClient.put<{ success: boolean; question: QuizQuestion }>(`/api/quiz/admin/question/${id}`, data);
    return response.data;
  },

  // 26. Delete Question
  deleteQuestion: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/quiz/admin/question/${id}`);
    return response.data;
  },

  // 27. Create Category
  createCategory: async (data: { name: string; description: string }) => {
    const response = await apiClient.post<{ success: boolean; categoryId: string; category: QuizCategory }>('/api/quiz/admin/category', data);
    return response.data;
  },

  // 28. Create Tournament
  createTournament: async (data: CreateTournamentData) => {
    const response = await apiClient.post<{ success: boolean; tournamentId: string; tournament: QuizTournament }>('/api/quiz/admin/tournament/create', data);
    return response.data;
  },

  // 29. Update Tournament
  updateTournament: async (id: string, data: UpdateTournamentData) => {
    const response = await apiClient.put<{ success: boolean; tournament: QuizTournament }>(`/api/quiz/admin/tournament/${id}`, data);
    return response.data;
  },

  // 30. Cancel Tournament
  cancelTournament: async (id: string, reason: string) => {
    const response = await apiClient.post<{ success: boolean; refundCount: number; totalRefunded: number; message: string }>(`/api/quiz/admin/tournament/${id}/cancel`, { reason });
    return response.data;
  },

  // 31. Start Tournament
  startTournament: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; startTime: string; participantCount: number; message: string }>(`/api/quiz/admin/tournament/${id}/start`);
    return response.data;
  },

  // 32. Get Admin Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get<{ success: boolean } & AdminDashboardStats>('/api/quiz/admin/dashboard');
    return response.data;
  },

  // 33. Adjust User Balance
  adjustUserBalance: async (userId: string | number, amount: number, reason: string) => {
    const response = await apiClient.post<{ success: boolean; newBalance: number; transactionId: string; message: string }>(`/api/quiz/admin/user/${userId}/adjust-balance`, { amount, reason });
    return response.data;
  },
};
