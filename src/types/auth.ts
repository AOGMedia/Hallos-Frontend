export interface SignupRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  ref?: string;
}

/** Sign-up step 1 answer: a code was emailed; the account is made once it's confirmed. */
export interface SignupCodeSent {
  verificationRequired: true;
  email: string;
  expiresInMinutes: number;
  resendAfterSeconds: number;
  message?: string;
}

/**
 * Starting a sign-up either asks for the emailed code, or — on a server
 * without email verification yet — creates the account straight away.
 */
export type SignupStartResult = { kind: 'verify'; sent: SignupCodeSent } | { kind: 'done'; auth: AuthResponse };

export interface VerifySignupRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthError {
  message?: string;
  code?: string;
  attemptsRemaining?: number;
  resendAfterSeconds?: number;
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role?: string;
  /** Profile picture (uploaded, or from Google sign-in). Null => show the initial. */
  avatarUrl?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  expiresIn?: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  resetToken: string;
  expiresIn: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}