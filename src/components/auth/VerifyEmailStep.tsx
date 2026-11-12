'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/Button';
import type { AuthError } from '@/types/auth';

const CODE_LENGTH = 6;

const messageOf = (error: AxiosError<AuthError> | null | undefined, fallback: string) => {
  if (!error) return null;
  const data = error.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.msg).join(', ');
  if (data?.message) return data.message;
  if (error.response?.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  return fallback;
};

interface VerifyEmailStepProps {
  email: string;
  expiresInMinutes: number;
  resendAfterSeconds: number;
  verifying: boolean;
  resending: boolean;
  verifyError: AxiosError<AuthError> | null;
  onVerify: (code: string) => void;
  onResend: () => Promise<{ resendAfterSeconds: number } | void>;
  onChangeEmail: () => void;
  onCodeEdited: () => void;
}

/**
 * Sign-up step 2: enter the 6-digit code we emailed. One real input under six
 * boxes, so pasting and the phone's "from Messages/Mail" code suggestion
 * both work; it submits by itself once six digits are in.
 */
export function VerifyEmailStep({
  email,
  expiresInMinutes,
  resendAfterSeconds,
  verifying,
  resending,
  verifyError,
  onVerify,
  onResend,
  onChangeEmail,
  onCodeEdited,
}: VerifyEmailStepProps) {
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(resendAfterSeconds);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedCode = useRef('');

  // Resend countdown: one tick a second, only while counting.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // After a wrong code, clear the boxes so the next try starts fresh.
  useEffect(() => {
    if (!verifyError) return;
    setCode('');
    submittedCode.current = '';
    inputRef.current?.focus();
  }, [verifyError]);

  const submit = (value: string) => {
    if (value.length !== CODE_LENGTH || verifying || submittedCode.current === value) return;
    submittedCode.current = value;
    onVerify(value);
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setResendNote(null);
    if (verifyError) onCodeEdited();
    if (digits.length === CODE_LENGTH) submit(digits);
  };

  const resend = async () => {
    setResendError(null);
    setResendNote(null);
    try {
      const result = await onResend();
      setSecondsLeft(result?.resendAfterSeconds ?? 60);
      setResendNote('We sent you a new code.');
      onCodeEdited(); // the old "wrong / expired code" message no longer applies
      setCode('');
      submittedCode.current = '';
      inputRef.current?.focus();
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const wait = axiosError.response?.data?.resendAfterSeconds;
      if (wait) setSecondsLeft(wait);
      setResendError(messageOf(axiosError, "We couldn't send a new code. Please try again."));
    }
  };

  const error = messageOf(verifyError, "We couldn't check that code. Please try again.");
  const attemptsLeft = verifyError?.response?.data?.attemptsRemaining;
  const mustResend = verifyError?.response?.data?.code === 'TOO_MANY_ATTEMPTS' || verifyError?.response?.data?.code === 'CODE_EXPIRED';
  const expired = verifyError?.response?.data?.code === 'SIGNUP_EXPIRED';

  const errorText = error
    ? `${error}${typeof attemptsLeft === 'number' && attemptsLeft > 0 ? ` ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left.` : ''}`
    : resendError;

  // Same layout and styles as the other auth screens (AuthForm, ForgotPasswordForm).
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
      <div className="mb-12">
        <Image src="/transparentlogo.svg" alt="Hallos logo" width={120} height={30} className="w-[100px] sm:w-[162px] h-auto" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
            <p className="text-base text-text-primary">
              We&apos;ve sent a 6-digit code to
              {/* Own line; only wraps if the address is wider than the screen. */}
              <span className="block font-semibold [overflow-wrap:anywhere]">{email}</span>
              Enter it below to finish creating your account.
            </p>
          </div>

          {/* Error Message */}
          {errorText && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-500">{errorText}</p>
            </div>
          )}

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              submittedCode.current = '';
              submit(code);
            }}
          >
            {/* Six boxes (auth-input look) drawn over one real input */}
            <label className="relative block cursor-text" onClick={() => inputRef.current?.focus()}>
              <span className="sr-only">Verification code</span>
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => onChange(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={CODE_LENGTH}
                autoFocus
                disabled={verifying || expired}
                // 16px so iPhone doesn't zoom in when it's focused.
                className="absolute inset-0 h-full w-full cursor-text text-base opacity-0"
              />
              <span aria-hidden className="grid grid-cols-6 gap-2 sm:gap-3">
                {Array.from({ length: CODE_LENGTH }, (_, i) => {
                  const current = i === code.length && !verifying && !expired;
                  return (
                    <span
                      key={i}
                      className={`auth-input flex h-14 items-center justify-center !p-0 !text-xl transition-colors ${
                        current ? '!border-primary' : ''
                      }`}
                    >
                      {code[i] ?? ''}
                    </span>
                  );
                })}
              </span>
            </label>

            {resendNote && !errorText && <p className="text-center text-sm text-green-400">{resendNote}</p>}

            <div className="flex flex-col gap-4">
              {expired ? (
                <Button type="button" variant="primary" size="lg" className="w-full" onClick={onChangeEmail}>
                  Start sign-up again
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={verifying || code.length !== CODE_LENGTH || mustResend}
                >
                  {verifying ? 'Verifying...' : 'Verify Code'}
                </Button>
              )}

              {!expired && (
                <p className="text-center text-sm text-[#888C94]">
                  Didn&apos;t receive it? Check spam, or{' '}
                  <button
                    type="button"
                    onClick={resend}
                    disabled={secondsLeft > 0 || resending || verifying}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : secondsLeft > 0 ? `Resend (${secondsLeft}s)` : 'Resend'}
                  </button>
                </p>
              )}

              <button
                type="button"
                onClick={onChangeEmail}
                disabled={verifying}
                className="text-center text-sm text-[#888C94] hover:text-text-primary transition-colors"
              >
                Change Email
              </button>

              <p className="text-center text-xs text-[#888C94]">The code works for {expiresInMinutes} minutes.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
