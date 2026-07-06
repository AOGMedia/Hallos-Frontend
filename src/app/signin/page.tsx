'use client';

import { AuthForm } from '@/components/auth/AuthForm';
// import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, Suspense } from 'react';

function SignInContent() {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();

  useEffect(() => {
    // Reset error when component mounts
    return () => resetLoginError();
  }, [resetLoginError]);

  const handleSignIn = (data: Record<string, string | boolean>) => {
    login({
      email: data.email as string,
      password: data.password as string,
    });
  };

  return (
    <AuthForm 
      mode="signin" 
      onSubmit={handleSignIn}
      isLoading={isLoggingIn}
      error={loginError}
    />
  );
}

export default function SignInPage() {
  return (
    // <RedirectIfAuthenticated>
      <Suspense fallback={<div>Loading...</div>}>
        <SignInContent />
      </Suspense>
    // </RedirectIfAuthenticated>
  );
}