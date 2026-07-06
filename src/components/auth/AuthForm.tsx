'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { useAuth } from '@/hooks/useAuth';
import GoogleIcon from '@/components/icons/GoogleIcon';
import ChevronDownAltIcon from '@/components/icons/ChevronDownAltIcon';
import type { AxiosError } from 'axios';
import type { AuthError } from '@/types/auth';
import Image from 'next/image';

interface AuthFormProps {
  mode: 'signup' | 'signin';
  onSubmit?: (data: Record<string, string | boolean>) => void;
  isLoading?: boolean;
  error?: AxiosError<AuthError> | null;
}

export function AuthForm({ mode, onSubmit, isLoading, error }: AuthFormProps) {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectQuery = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
  
  // console.log('AuthForm - Mode:', mode);
  // console.log('AuthForm - Redirect param:', redirectParam);
  // console.log('AuthForm - Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
  
  const [showMoreOptions, setShowMoreOptions] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const { loginWithGoogle: _loginWithGoogle } = useAuth();
  const isSignup = mode === 'signup';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData as Record<string, string | boolean>);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format error message
  const getErrorMessage = () => {
    if (!error) return null;
    
    const errorData = error.response?.data;
    
    // Handle validation errors
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      return errorData.errors.map(err => err.msg).join(', ');
    }
    
    // Handle general error message
    if (errorData?.message) {
      return errorData.message;
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    
    return 'An error occurred. Please try again.';
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
            src="/transparentlogo.svg"
            alt="aahbibi Logo"
            width={120}
            height={30}
            // fill
            className="w-[100px] sm:w-[162px] h-auto"
          />
</div>
      <div className="relative w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              {isSignup ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-base text-text-primary">
              {isSignup 
                ? 'Connect, learn, and sharpen your skills in real-time.'
                : 'Choose your preferred way of logging into your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-500">{getErrorMessage()}</p>
            </div>
          )}

          {/* Form Options */}
          <div className="flex flex-col gap-6">
            {/* Social Login */}
            <div className="flex flex-col gap-5">
              <SocialLoginButton 
                provider="google" 
                icon={<GoogleIcon width={24} height={25} />}
                onClick={_loginWithGoogle}
                disabled={isLoading}
              >
                {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
              </SocialLoginButton>

              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="flex items-center justify-center gap-2.5 text-xs text-[#888C94] hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                <ChevronDownAltIcon 
                  width={17} 
                  height={9} 
                  color="#888C94"
                  className={`transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
                />
                More options
              </button>
            </div>

            {/* Form Fields */}
            {showMoreOptions && (
              <div className="flex flex-col gap-5">
                {isSignup && (
                  <div className="grid grid-cols-2 gap-5">
                    <FormField
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <FormField
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <FormField
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />

                <FormField
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  showPasswordToggle
                  required
                  disabled={isLoading}
                />
                
                {!isSignup && (
                  <div className="flex justify-end -mt-3">
                    <Link 
                      href={`/forgot-password${redirectQuery}`}
                      className="text-xs text-[#888C94] hover:text-text-primary transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}

                {isSignup && (
                  <FormField
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    showPasswordToggle
                    required
                    disabled={isLoading}
                  />
                )}
              </div>
            )}

            {/* Terms Checkbox */}
            {isSignup && showMoreOptions && (
              <Checkbox
                checked={formData.agreeToTerms}
                onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                disabled={isLoading}
                label={
                  <span>
                    By checking this box you agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      terms of use
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      privacy policy
                    </Link>
                  </span>
                }
              />
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              className="w-full"
              disabled={
                isLoading || 
                (isSignup && showMoreOptions && !formData.agreeToTerms)
              }
            >
              {isLoading ? 'Please wait...' : 'Continue'}
            </Button>

            {/* Toggle Auth Mode */}
            <p className="text-xs text-center text-[#EAEAEA]">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link href={`/signin${redirectQuery}`} className="text-primary hover:underline font-medium">
                    Log In
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <Link href={`/signup${redirectQuery}`} className="text-primary hover:underline font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}