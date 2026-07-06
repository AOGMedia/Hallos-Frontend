import { create } from 'zustand';
import { 
  adminDashboardService, 
  DashboardStats, 
  UserSummary, 
  Payout, 
  UserDetail 
} from '@/services/adminDashboardService';
import { 
  adminService, 
  Enrollment, 
  EnrollmentStats 
} from '@/services/adminService';

interface AdminDashboardState {
  // Stats
  stats: DashboardStats | null;
  loadingStats: boolean;
  
  // Users
  users: UserSummary[];
  paginationUsers: { total: number; page: number; limit: number; totalPages: number };
  loadingUsers: boolean;
  currentUser: UserDetail | null;
  loadingUserDetail: boolean;

  // Payouts
  payouts: Payout[];
  paginationPayouts: { total: number; page: number; limit: number; totalPages: number };
  loadingPayouts: boolean;

  // Enrollments (Legacy/Existing)
  enrollments: Enrollment[];
  enrollmentSummary: EnrollmentStats | null;
  loadingEnrollments: boolean;

  // Modal States
  modals: {
    userDetail: { isOpen: boolean; userId: number | null };
    security: { isOpen: boolean };
    audit: { isOpen: boolean };
    transactions: { isOpen: boolean };
    feedback: { isOpen: boolean };
    sessionRecording: { isOpen: boolean };
    agency: { isOpen: boolean };
    referral: { isOpen: boolean };
    partnerReferral: { isOpen: boolean };
    coupons: { isOpen: boolean };
    community: { isOpen: boolean };
  };

  // Toast State
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  };

  // Actions
  fetchStats: () => Promise<void>;
  fetchUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) => Promise<void>;
  fetchUserDetail: (id: number) => Promise<void>;
  updateUserRole: (id: number, role: string) => Promise<boolean>;
  fetchPayouts: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  approvePayout: (id: string) => Promise<boolean>;
  rejectPayout: (id: string, reason: string) => Promise<boolean>;
  
  // Enrollment Actions
  fetchEnrollments: (params?: Record<string, unknown>) => Promise<void>;

  // Modal Actions
  openModal: (modalName: keyof AdminDashboardState['modals'], data?: Record<string, unknown>) => void;
  closeModal: (modalName: keyof AdminDashboardState['modals']) => void;
  
  // Toast Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Security Actions
  unblockUser: (userId: number) => Promise<boolean>;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set, get) => ({
  stats: null,
  loadingStats: false,

  users: [],
  paginationUsers: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loadingUsers: false,
  currentUser: null,
  loadingUserDetail: false,

  payouts: [],
  paginationPayouts: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loadingPayouts: false,

  enrollments: [],
  enrollmentSummary: null,
  loadingEnrollments: false,

  modals: {
    userDetail: { isOpen: false, userId: null },
    security: { isOpen: false },
    audit: { isOpen: false },
    transactions: { isOpen: false },
    feedback: { isOpen: false },
    sessionRecording: { isOpen: false },
    agency: { isOpen: false },
    referral: { isOpen: false },
    partnerReferral: { isOpen: false },
    coupons: { isOpen: false },
    community: { isOpen: false },
  },

  toast: {
    message: '',
    type: 'info',
    isVisible: false,
  },

  // Actions
  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const data = await adminDashboardService.getDashboardStats();
      if (data.success) {
        set({ stats: data });
      }
    } catch {
      console.error('Failed to fetch dashboard stats:');
    } finally {
      set({ loadingStats: false });
    }
  },

  fetchUsers: async (params) => {
    set({ loadingUsers: true });
    try {
      const data = await adminDashboardService.getUsers(params);
      if (data.success) {
        set({ users: data.users, paginationUsers: data.pagination });
      }
    } catch {
      console.error('Failed to fetch users:');
    } finally {
      set({ loadingUsers: false });
    }
  },

  fetchUserDetail: async (id) => {
    set({ loadingUserDetail: true });
    try {
      const data = await adminDashboardService.getUserDetail(id);
      if (data.success) {
        set({ currentUser: data.user });
      }
    } catch {
      console.error('Failed to fetch user detail:');
    } finally {
      set({ loadingUserDetail: false });
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const data = await adminDashboardService.updateUserRole(id, role);
      if (data.success) {
        get().showToast('User role updated successfully', 'success');
        get().fetchUsers({ page: get().paginationUsers.page });
        return true;
      }
      get().showToast(data.message || 'Failed to update user role', 'error');
      return false;
    } catch {
      get().showToast('An error occurred during role update', 'error');
      return false;
    }
  },

  fetchPayouts: async (params) => {
    set({ loadingPayouts: true });
    try {
      const data = await adminDashboardService.getPayouts(params);
      if (data.success) {
        set({ payouts: data.payouts, paginationPayouts: data.pagination });
      }
    } catch {
      console.error('Failed to fetch payouts:');
    } finally {
      set({ loadingPayouts: false });
    }
  },

  approvePayout: async (id) => {
    try {
      const data = await adminDashboardService.approvePayout(id);
      if (data.success) {
        get().showToast('Payout approved and transfer initiated', 'success');
        get().fetchPayouts({ page: get().paginationPayouts.page });
        return true;
      }
      get().showToast(data.message || 'Failed to approve payout', 'error');
      return false;
    } catch {
      get().showToast('An error occurred during payout approval', 'error');
      return false;
    }
  },

  rejectPayout: async (id, reason) => {
    try {
      const data = await adminDashboardService.rejectPayout(id, reason);
      if (data.success) {
        get().showToast('Payout rejected successfully', 'success');
        get().fetchPayouts({ page: get().paginationPayouts.page });
        return true;
      }
      get().showToast(data.message || 'Failed to reject payout', 'error');
      return false;
    } catch {
      get().showToast('An error occurred during payout rejection', 'error');
      return false;
    }
  },

  fetchEnrollments: async (params) => {
    set({ loadingEnrollments: true });
    try {
       const data = await adminService.getEnrollments(params);
       if (data.success) {
          set({ enrollments: data.enrollments, enrollmentSummary: data.summary });
       }
    } catch {
       console.error('Failed to fetch enrollments:');
    } finally {
       set({ loadingEnrollments: false });
    }
  },

  openModal: (modalName, data) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: true, ...data },
      },
    }));
    
    // Auto-fetch details if userDetail modal
    if (modalName === 'userDetail' && data?.userId) {
      get().fetchUserDetail(data.userId as number);
    }
  },

  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: false, userId: null },
      },
    }));
    
    // Clear state when closing specific modals
    if (modalName === 'userDetail') {
      set({ currentUser: null });
    }
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, isVisible: true } });
    setTimeout(() => get().hideToast(), 3000);
  },

  hideToast: () => {
    set((state) => ({ toast: { ...state.toast, isVisible: false } }));
  },

  unblockUser: async (userId) => {
    try {
      const data = await adminDashboardService.unblockUser(userId);
      if (data.success) {
        get().showToast('User unblocked successfully', 'success');
        return true;
      }
      get().showToast(data.message || 'Failed to unblock user', 'error');
      return false;
    } catch {
       get().showToast('An error occurred during unblocking', 'error');
       return false;
    }
  },
}));
