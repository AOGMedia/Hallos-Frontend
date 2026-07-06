'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </RedirectIfAuthenticated>
  );
}
