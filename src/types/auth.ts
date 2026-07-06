export interface SignupRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  ref?: string;
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