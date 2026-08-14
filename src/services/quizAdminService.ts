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

/** Mirrors the backend's QuizTournament.status enum exactly */
export type QuizTournamentStatus =
  | 'draft'
  | 'pending_review'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface QuizTournament {
  id: string;
  name: string;
  description?: string;
  format?: 'classic' | 'speed_run' | 'knockout' | 'battle_royale';
  status: QuizTournamentStatus;
  prizePool: number;
  entryFee?: number;
  maxParticipants?: number | null;
  minParticipants?: number;
  currentRound?: number;
  totalRounds?: number;
  createdAt: string;
  startTime?: string;
  registrationDeadline?: string;
  /** Set when a user proposed this rather than an admin creating it */
  proposedBy?: number | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface TournamentProposalsResponse {
  success: boolean;
  proposals: QuizTournament[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface TournamentOverviewRound {
  id: string;
  roundNumber: number;
  status: 'pending' | 'active' | 'completed';
  questions: string[];
  participants: Array<{
    userId: number;
    score: number;
    completionTime: number | null;
    rank: number | null;
    matchId?: string;
    bye?: boolean;
    answers?: string[];
  }>;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TournamentOverviewMatch {
  id: string;
  roundNumber: number;
  status: string;
  challengerId: number;
  opponentId: number;
  winnerId: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TournamentOverviewResponse {
  success: boolean;
  tournament: QuizTournament;
  participantCount: number;
  statusCounts: Record<string, number>;
  rounds: TournamentOverviewRound[];
  matches: TournamentOverviewMatch[];
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
  /**
   * List tournaments. The public listing endpoint only returns
   * open/in_progress/completed/cancelled — proposals awaiting review come from
   * getTournamentProposals below, since they're deliberately not public.
   */
  getTournaments: async (params: { status?: QuizTournamentStatus; page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<{
      success: boolean;
      tournaments: QuizTournament[];
      totalCount: number;
      page: number;
      totalPages: number;
    }>('/api/quiz/tournaments', { params: { page: 1, limit: 50, ...params } });
    return response.data;
  },

  // --- User-hosted proposal review ---

  getTournamentProposals: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<TournamentProposalsResponse>(
      '/api/quiz/admin/tournament/proposals',
      { params: { page: 1, limit: 20, ...params } }
    );
    return response.data;
  },

  approveTournamentProposal: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; tournament: QuizTournament; message?: string }>(
      `/api/quiz/admin/tournament/${id}/approve`
    );
    return response.data;
  },

  rejectTournamentProposal: async (id: string, reason: string) => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/api/quiz/admin/tournament/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  // --- Live monitoring ---

  getTournamentOverview: async (id: string) => {
    const response = await apiClient.get<TournamentOverviewResponse>(
      `/api/quiz/admin/tournament/${id}/overview`
    );
    return response.data;
  },

  /** Last-resort override: pays out prizes from current standings */
  forceFinalizeTournament: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/api/quiz/admin/tournament/${id}/force-finalize`
    );
    return response.data;
  },

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
