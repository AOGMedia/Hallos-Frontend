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
  SignupCodeSent,
  SignupStartResult,
  VerifySignupRequest,
} from '@/types/auth';
import { apiClient } from './client';
import { savePendingSignupReferral } from '@/lib/referral/pendingSignupReferral';

export const authApi = {
  // Signup (one step — used only as the fallback below)
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * Sign-up step 1: the server emails a 6-digit code. If the server doesn't
   * have email verification yet (404), sign up the old way so sign-up keeps
   * working whichever is deployed first.
   */
  signupStart: async (data: SignupRequest): Promise<SignupStartResult> => {
    try {
      const response = await apiClient.post<SignupCodeSent>('/auth/signup/start', data);
      return { kind: 'verify', sent: response.data };
    } catch (error) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return { kind: 'done', auth: await authApi.signup(data) };
      }
      throw error;
    }
  },

  /** Sign-up step 2: the right code creates the account and returns the login token. */
  signupVerify: async (data: VerifySignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup/verify', data);
    return response.data;
  },

  signupResend: async (email: string): Promise<SignupCodeSent> => {
    const response = await apiClient.post<SignupCodeSent>('/auth/signup/resend', { email });
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
      // A partner link's code, credited after Google brings them back (see auth/callback).
      const referralCode = urlParams.get('ref');
      if (referralCode) savePendingSignupReferral(referralCode);

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
    // /auth/me answers { success, data: { id, ... } } — read the user from `data`.
    const raw = (data as { data?: unknown }).data ?? (data as { user?: unknown }).user ?? data;
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