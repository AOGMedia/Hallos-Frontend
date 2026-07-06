'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { authApi } from '@/lib/api/auth';
import Image from 'next/image';
import type { AxiosError } from 'axios';
import type { AuthError } from '@/types/auth';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectQuery = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
  
  const [step, setStep] = useState<Step>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Resend Timer Logic
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      setResendDisabled(true);
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const getErrorMessage = (err: unknown) => {
    const error = err as AxiosError<AuthError>;
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return 'An error occurred. Please try again.';
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      setStep('OTP');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyResetOtp({ email, otp });
      setResetToken(response.resetToken);
      setStep('PASSWORD');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });
      setStep('SUCCESS');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setError(null);
    try {
      await authApi.resendResetOtp({ email });
      setCountdown(120); // Start 2 minute countdown
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      const message = error.response?.data?.message || '';
      
      // Parse "Please wait X seconds"
      const waitMatch = message.match(/wait (\d+) seconds/);
      if (waitMatch) {
         setCountdown(parseInt(waitMatch[1], 10));
      } else {
         setError(message || 'An error occurred');
         setResendDisabled(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden ">
      {/* Gradient blur effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[209px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(50% 50% at 52.82% 50%, #4B7CE3 0%, #154CC2 100%)',
          filter: 'blur(143.54px)',
        }}
      />
      <div className='mb-12'>
        <Image
          src="/transparentLogo.svg"
          alt="Learning247 Logo"
          width={120}
          height={30}
          className="w-[100px] sm:w-[162px] h-auto"
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              {step === 'EMAIL' && 'Forgot Password'}
              {step === 'OTP' && 'Check your email'}
              {step === 'PASSWORD' && 'Reset Password'}
              {step === 'SUCCESS' && 'Password Reset Successful'}
            </h1>
            <p className="text-base text-text-primary">
              {step === 'EMAIL' && 'Enter your email to receive a reset code.'}
              {step === 'OTP' && `We've sent a 6-digit code to ${email}. Enter it below.`}
              {step === 'PASSWORD' && 'Create a new secure password.'}
              {step === 'SUCCESS' && 'You can now log in with your new password.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Steps */}
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
              <FormField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
                <Link href={`/signin${redirectQuery}`} className="text-center text-sm text-[#888C94] hover:text-text-primary transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <FormField
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <p className="text-center text-sm text-[#888C94]">
                  Didn&apos;t receive it?{' '}
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled || isLoading}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
                  </button>
                </p>
                <button 
                  type="button" 
                  onClick={() => setStep('EMAIL')}
                  className="text-center text-sm text-[#888C94] hover:text-text-primary transition-colors"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {step === 'PASSWORD' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
              <FormField
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showPasswordToggle
                required
                disabled={isLoading}
              />
              <FormField
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPasswordToggle
                required
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col gap-6">
              <Button 
                onClick={() => router.push(`/signin${redirectQuery}`)}
                variant="primary" 
                size="lg" 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
