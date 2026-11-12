'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { VerifyEmailStep } from '@/components/auth/VerifyEmailStep';
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SignUpContent() {
  const {
    signup,
    isSigningUp,
    signupError,
    resetSignupError,
    pendingSignup,
    verifySignup,
    resendSignupCode,
    isVerifyingSignup,
    isResendingSignupCode,
    verifySignupError,
    resetVerifySignupError,
  } = useAuth();
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

  // Back from the code step to the (still filled-in) form.
  const changeEmail = () => {
    resetVerifySignupError();
    resetSignupError();
  };

  return (
    <>
      {pendingSignup && (
        <VerifyEmailStep
          email={pendingSignup.email}
          expiresInMinutes={pendingSignup.expiresInMinutes}
          resendAfterSeconds={pendingSignup.resendAfterSeconds}
          verifying={isVerifyingSignup}
          resending={isResendingSignupCode}
          verifyError={verifySignupError}
          onVerify={(code) => verifySignup({ email: pendingSignup.email, code })}
          onResend={() => resendSignupCode(pendingSignup.email)}
          onChangeEmail={changeEmail}
          onCodeEdited={resetVerifySignupError}
        />
      )}
      {/* Kept mounted (just hidden) during the code step so "Change email" returns to a filled-in form. */}
      <div hidden={!!pendingSignup}>
        <AuthForm mode="signup" onSubmit={handleSignUp} isLoading={isSigningUp} error={signupError} />
      </div>
    </>
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
