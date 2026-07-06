
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/paymentStore";
import { initializePayment, verifyPayment } from "@/lib/api/payments";
import { apiClient } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { v4 as uuidv4 } from 'uuid';

export function PaymentModal() {
  const router = useRouter();
  const {
    isModalOpen,
    price,
    currency,
    supportedCurrencies,
    // gatewayMapping,
    defaultCurrency,
    isInitializing,
    isVerifying,
    isChecking,
    error,
    contentType,
    contentId,
    couponCode,
    fetchConfig,
    // setPriceCurrency,
    setError,
    setIsInitializing,
    setIsVerifying,
    setPaymentReference,
    setCheckoutUrl,
    closeModal,
    markContentAsPurchased,
  } = usePaymentStore();

  const checkoutWindowRef = useRef<Window | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency || defaultCurrency || 'NGN');
  const { user } = useCurrentUser();

  useEffect(() => {
    if (isModalOpen) {
      fetchConfig();
    }
  }, [isModalOpen, fetchConfig]);

  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
    } else if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [currency, defaultCurrency]);

  const toAbsoluteUrl = useCallback((u?: string): string | undefined => {
    if (!u) return undefined;
    const s = String(u);
    if (/^https?:\/\//i.test(s)) return s;
    const baseEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const baseClient = String(apiClient.defaults.baseURL || "").replace(/\/$/, "");
    const base = baseEnv || baseClient;
    if (!base) return s;
    return `${base}${s.startsWith("/") ? s : `/${s}`}`;
  }, []);

  // Initialize payment
  const onInitialize = useCallback(async () => {
    if (!contentType || !contentId) return;
    setError(undefined);
    setIsInitializing(true);
    
    // Generate Idempotency Key
    const idempotencyKey = uuidv4();

    try {
      checkoutWindowRef.current = window.open("", "_blank");
      const callbackUrl = `${window.location.origin}/payments/verify`;
      
      const userDetails = user ? {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: '0000000000' // Placeholder as user object doesn't have phone. 
                            // TODO: Consider prompting for phone or updating profile
      } : undefined;

      // Pass currency instead of gateway
      const res = await initializePayment(
        { 
          contentType, 
          contentId, 
          currency: selectedCurrency, 
          callbackUrl, 
          userDetails,
          couponCode: couponCode || undefined
        },
        idempotencyKey
      );

      // Check if free access was granted (no payment needed)
      if (!res.data) {
        setError("Payment initialization failed - no payment data returned.");
        if (checkoutWindowRef.current) checkoutWindowRef.current.close();
        return;
      }

      const url = toAbsoluteUrl(res.data.authorizationUrl ?? res.data.checkoutUrl);
      if (!url) {
        setError(res.message || "No checkout URL returned. Please try another currency.");
        if (checkoutWindowRef.current) checkoutWindowRef.current.close();
        return;
      }
      setCheckoutUrl(url);
      
      // Store reference
      if (res.data.gateway === "paystack") {
        setPaymentReference(res.data.reference);
      } else {
        setPaymentReference(res.data.sessionId || res.data.reference);
      }

      if (checkoutWindowRef.current) {
        checkoutWindowRef.current.location.assign(url);
      } else {
        try {
          window.open(url, "_blank", "noopener,noreferrer");
        } catch {
          router.push(url);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize payment.";
      setError(msg);
      if (checkoutWindowRef.current) checkoutWindowRef.current.close();
    } finally {
      setIsInitializing(false);
    }
  }, [contentType, contentId, selectedCurrency, setError, setIsInitializing, setCheckoutUrl, setPaymentReference, router, toAbsoluteUrl, user, couponCode]);

  // Verify payment
  const onVerify = useCallback(async () => {
    if (!contentType || !contentId) return;
    const state = usePaymentStore.getState();
    const reference = state.paymentReference;
    if (!reference) return;

    setError(undefined);
    setIsVerifying(true);
    
    // Generate Idempotency Key for verification too? Or just use one for the action.
    const idempotencyKey = uuidv4();

    try {
      const res = await verifyPayment(reference, selectedCurrency, idempotencyKey);
      if (res.success && res.purchase?.paymentStatus === "success") {
        // Mark content as purchased in store
        markContentAsPurchased(contentType, contentId, user?.id?.toString());

        // Close modal and navigate
        closeModal();
        if (contentType === 'live') {
          router.push(`/live/${contentId}/room`);
        } else if (contentType === 'live_class') {
          router.push(`/live/join/${contentId}?payment=success`);
        } else if (contentType === 'live_series') {
          router.push(`/series/${contentId}?payment=success`);
        } else {
          router.push(`/dashboard/video/${contentId}`);
        }
      } else {
        setError(res.message || "Payment could not be verified. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying payment.";
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [contentType, contentId, selectedCurrency, markContentAsPurchased, closeModal, router, setError, setIsVerifying, user?.id]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => closeModal()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paywall"
        className="relative z-10 w-[90%] max-w-md rounded-2xl bg-[#1f2636] p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-medium font-semibold text-[#eaeaea]">Unlock this content</h2>
          <button onClick={() => closeModal()} className="text-small underline opacity-80 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-small">Price</span>
            <span className="text-medium font-semibold">
              {price ? `${selectedCurrency} ${price}` : 'Loading...'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <span className="text-muted-small">Available Currency</span>
          <div className="flex items-center gap-4">
            {supportedCurrencies.length > 0 ? (
                supportedCurrencies
                .filter(c => !currency || c === currency)
                .map((curr) => (
                    <label key={curr} className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="currency"
                        value={curr}
                        checked={selectedCurrency === curr}
                        onChange={() => setSelectedCurrency(curr)}
                        className="accent-green-500 cursor-pointer"
                    />
                    <span className="text-small">{curr}</span>
                    </label>
                ))
            ) : (
                <span className="text-muted-small">Loading currencies...</span>
            )}
           
          </div>
        </div>

        {error && <div className="mb-3 text-accent-red text-small">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            onClick={onInitialize}
            disabled={isChecking || isInitializing}
            className="flex items-center justify-center gap-2 px-6 py-[12px] rounded-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-white text-small">{isInitializing ? "Redirecting…" : "Continue to Checkout"}</span>
          </button>

          <button
            onClick={onVerify}
            disabled={isChecking || isVerifying}
            className="flex items-center justify-center gap-2 px-6 py-[12px] rounded-full border border-[rgba(106,87,229,1)] bg-[rgba(106,87,229,0.01)] hover:bg-[rgba(106,87,229,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-[#eaeaea] text-small">{isVerifying ? "Verifying…" : "Verify Payment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


