'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SignUpContent() {
  const { signup, isSigningUp, signupError, resetSignupError } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset error when component mounts
    return () => resetSignupError();
  }, [resetSignupError]);

  const handleSignUp = (data: Record<string, string | boolean>) => {
    const ref = searchParams.get('ref') ?? undefined;
    signup({
      firstname: data.firstName as string,
      lastname: data.lastName as string,
      email: data.email as string,
      password: data.password as string,
      confirmPassword: data.confirmPassword as string,
      ...(ref && { ref }),
    });
  };

  return (
    <AuthForm 
      mode="signup" 
      onSubmit={handleSignUp}
      isLoading={isSigningUp}
      error={signupError}
    />
  );
}

export default function SignUpPage() {
  return (
    <RedirectIfAuthenticated>
      <Suspense fallback={<div>Loading...</div>}>
        <SignUpContent />
      </Suspense>
    </RedirectIfAuthenticated>
  );
}