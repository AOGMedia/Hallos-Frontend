
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  AuthError,
  SignupCodeSent,
  SignupStartResult,
  VerifySignupRequest,
} from '@/types/auth';
import type { AxiosError } from 'axios';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, user, setUser } = useAuthStore();
  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && (!isAuthenticated || !user)) {
        try {
          if (!isAuthenticated) setAuth(token);
          const res = await authApi.me();
          if (res.user) setUser(res.user);
          // console.log("user id from useauth",user?.id, user?.email, user?.lastname);
          
        } catch {}
      }
    };
    load();
  }, [isAuthenticated, user, setAuth, setUser]);

  // Account created (after the email code): store the session, then go on.
  const completeSignup = async (data: AuthResponse) => {
      localStorage.setItem("auth_token", data.token);
      setAuth(data.token);
      let u = data.user;
      if (!u || !u.id) {
        try {
          const res = await authApi.me();
          u = res.user;
        } catch {}
      }
      if (u && u.id) {
        localStorage.setItem("user_id", u.id);
        setUser(u);
      }

      // Handle community invite token if present in URL
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');
      if (inviteToken) {
        try {
          const { joinCommunityViaInvite } = await import('@/lib/api/community');
          await joinCommunityViaInvite(inviteToken);
        } catch {
          // Invite join failed silently — user still registered successfully
        }
      }
      
      // Check for redirect parameter
      const redirectTo = urlParams.get('redirect') || localStorage.getItem('auth_redirect');
    
      
      // replace, not push: the sign-up page shouldn't stay in history, or
      // "Back" on the next page would land on it again.
      if (redirectTo) {
        // console.log('Redirecting to:', redirectTo);
        localStorage.removeItem('auth_redirect'); // Clean up
        router.replace(redirectTo);
      } else {
        // console.log('No redirect parameter, going to dashboard');
        router.replace('/dashboard');
      }
  };

  // SIGNUP — step 1: details in, a code is emailed (no account yet).
  const signupMutation = useMutation<
    SignupStartResult,
    AxiosError<AuthError>,
    SignupRequest
  >({
    mutationFn: authApi.signupStart,
    onSuccess: async (result) => {
      // A server without email verification signs up in one step.
      if (result.kind === 'done') await completeSignup(result.auth);
    },
  });

  // SIGNUP — step 2: the emailed code creates the account.
  const verifySignupMutation = useMutation<AuthResponse, AxiosError<AuthError>, VerifySignupRequest>({
    mutationFn: authApi.signupVerify,
    onSuccess: completeSignup,
  });

  const resendCodeMutation = useMutation<SignupCodeSent, AxiosError<AuthError>, string>({
    mutationFn: authApi.signupResend,
  });

  const pendingSignup = signupMutation.data?.kind === 'verify' ? signupMutation.data.sent : null;

  // LOGIN MUTATION
  const loginMutation = useMutation<
    AuthResponse,
    AxiosError<AuthError>,
    LoginRequest
  >({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // console.log('Login response data:', data);
      // console.log('User from login:', data.user);
      // console.log('User role from login:', data.user?.role);
      
      localStorage.setItem("auth_token", data.token);
      setAuth(data.token);
      let u = data.user;
      
      // If user data is incomplete, fetch from /me endpoint
      if (!u || !u.id || !u.role) {
        // console.log('User data incomplete, fetching from /me endpoint');
        try {
          const res = await authApi.me();
          // console.log('User from /me endpoint:', res.user);
          u = res.user;
        } catch (error) {
          console.error('Error fetching user :', error);
        }
      }
      
      if (u && u.id) {
        localStorage.setItem("user_id", u.id);
        setUser(u);
        // console.log("Setting user in store - id:", u.id, "role:", u.role);
      }
      
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || localStorage.getItem('auth_redirect');
      
      // replace, not push: the sign-in page shouldn't stay in history, or
      // "Back" on the next page would land on it again.
      if (redirectTo) {
        // console.log('Redirecting to:', redirectTo);
        localStorage.removeItem('auth_redirect');
        router.replace(redirectTo);
      } else {
        console.log('No redirect parameter, checking role. User role:');
        // Check role and redirect accordingly
        if (u && u.role === 'admin') {
            // console.log('👑 User is admin');
            router.replace('/admin');
        } else {
            // console.log('👤 User is not admin (role:', u?.role, '), redirecting to /dashboard');
            router.replace('/dashboard');
        }
      }
    },
  });
  useEffect(() => {
  if (user) {
    // console.log("user updated:", user.email, user.lastname);
  }
}, [user]);


  // LOGOUT
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearAuth();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");

    router.push('/signin');
  };

  // Google login redirect
  const loginWithGoogle = () => {
    authApi.googleLogin();
  };

  return {
    // State
    isAuthenticated,
    user,

    // Mutations
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout,
    loginWithGoogle,

    // Sign-up email code (step 2): set once a code has been sent
    pendingSignup,
    verifySignup: verifySignupMutation.mutate,
    resendSignupCode: resendCodeMutation.mutateAsync,
    isVerifyingSignup: verifySignupMutation.isPending || verifySignupMutation.isSuccess,
    isResendingSignupCode: resendCodeMutation.isPending,
    verifySignupError: verifySignupMutation.error,
    resendSignupCodeError: resendCodeMutation.error,
    resetVerifySignupError: verifySignupMutation.reset,

    // Loading states
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,

    // Errors
    signupError: signupMutation.error,
    loginError: loginMutation.error,

    // Reset errors (resetting sign-up also goes back from the code step)
    resetSignupError: signupMutation.reset,
    resetLoginError: loginMutation.reset,
  };
}
