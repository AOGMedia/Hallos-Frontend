import type { 
  SignupRequest, 
  LoginRequest, 
  AuthResponse, 
  User,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendOtpRequest,
} from '@/types/auth';
import { apiClient } from './client';

export const authApi = {
  // Signup
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Forgot Password Steps
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  verifyResetOtp: async (data: VerifyResetOtpRequest): Promise<VerifyResetOtpResponse> => {
    const response = await apiClient.post<VerifyResetOtpResponse>('/auth/verify-reset-otp', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  },

  resendResetOtp: async (data: ResendOtpRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/resend-reset-otp', data);
    return response.data;
  },

  // Google OAuth (redirect to backend)
  googleLogin: () => {
    if (typeof window !== 'undefined') {
      // Store current redirect parameter in localStorage for OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      if (redirectTo) {
        localStorage.setItem('auth_redirect', redirectTo);
      }
      
      const base = apiClient.defaults.baseURL || '';
      const origin = window.location.origin;
      const redirect = encodeURIComponent(`${origin}/auth/callback`);
      const url = `${base}/auth/google?redirect_uri=${redirect}`;
      window.location.href = url;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    // If you have a logout endpoint
    // await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  me: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/me');
    const data = response.data as unknown;
    const raw = (data as { user?: unknown }).user ?? data;
    const r = raw as Record<string, unknown>;
    const idVal = (r.id ?? r._id) as string | number | undefined;
    const email = r.email as string | undefined;
    const firstname = (r.firstname ?? r.firstName) as string | undefined;
    const lastname = (r.lastname ?? r.lastName) as string | undefined;
    const user: User = {
      id: idVal !== undefined ? String(idVal) : (email ? `email:${email}` : 'unknown'),
      email: email ?? '',
      firstname: firstname ?? '',
      lastname: lastname ?? '',
    };
    return { user };
  },
};