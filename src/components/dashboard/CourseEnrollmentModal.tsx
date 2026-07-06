"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/paymentStore";
import { initializePayment, verifyPayment } from "@/lib/api/payments";
import { apiClient } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { v4 as uuidv4 } from "uuid";
import { X, Check, Loader2, CreditCard } from "lucide-react";
import { CouponInput } from "@/components/checkout/CouponInput";
import { CouponValidationData } from "@/types/coupon";

export function CourseEnrollmentModal() {
  const router = useRouter();
  const {
    isEnrollmentModalOpen,
    price: basePrice, // This is the individual price
    currency,
    defaultCurrency,
    isInitializing,
    isVerifying,
    error,
    contentType,
    contentId,
    accessType,
    closeEnrollmentModal,
    setError,
    setIsInitializing,
    setIsVerifying,
    setPaymentReference,
    setCheckoutUrl,
    setAccessType,
    setCouponCode,
    markContentAsPurchased,
    fetchConfig,
    checkoutUrl: storeCheckoutUrl, // Get existing checkout URL
    paymentReference
  } = usePaymentStore();

  const checkoutWindowRef = useRef<Window | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currency || defaultCurrency || "NGN"
  );
  const { user, loading: userLoading } = useCurrentUser();
  const [localCoupon, setLocalCoupon] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    discount: number;
    finalPrice: number;
    regularPrice: number;
    } | null>(null);

  // Fetch config when modal opens
  useEffect(() => {
      if (isEnrollmentModalOpen) {
          fetchConfig();
      }
  }, [isEnrollmentModalOpen, fetchConfig]);

  // Sync store currency to local state
  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
    } else if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [currency, defaultCurrency]);

  // Reset cached payment data when access type changes
  useEffect(() => {
    if (isEnrollmentModalOpen) {
      // Clear cached checkout URL and payment reference when access type changes
      setCheckoutUrl(undefined);
      setPaymentReference(undefined);
      setDiscountInfo(null);
    }
  }, [accessType, isEnrollmentModalOpen, setCheckoutUrl, setPaymentReference]);

  // Reset local state when modal opens
  useEffect(() => {
    if (isEnrollmentModalOpen) {
      setLocalCoupon("");
      setDiscountInfo(null);
      setError(undefined);
    }
  }, [isEnrollmentModalOpen, setError]);

  const toAbsoluteUrl = useCallback((u?: string): string | undefined => {
    if (!u) return undefined;
    const s = String(u);
    if (/^https?:\/\//i.test(s)) return s;
    const baseEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const baseClient = String(apiClient.defaults.baseURL || "").replace(
      /\/$/,
      ""
    );
    const base = baseEnv || baseClient;
    if (!base) return s;
    return `${base}${s.startsWith("/") ? s : `/${s}`}`;
  }, []);

  // Estimated Pricing Logic (Mock for UI responsiveness, real calculation happens on backend)
  // In a real app, you might want an endpoint to calculate price before purchase.
  const getRegularPrice = () => {
    // If we have backend pricing, use it
    if (discountInfo) return discountInfo.regularPrice.toLocaleString();
    
    // Simple mock estimation if no backend calc yet
    // NOTE: This should ideally come from backend config or passed prop
    let amount = 0;
    if (basePrice) {
        amount = parseFloat(basePrice.replace(/[^0-9.]/g, ""));
    }
    
    // If base price is 0 (missing from API), use default individual price
    if (amount === 0) {
        amount = selectedCurrency === 'USD' ? 30 : 25000;
    }

    // Adjust for access type
    if (accessType === 'monthly') {
        const monthlyPrice = selectedCurrency === 'USD' ? 42 : 35000;
        return monthlyPrice.toLocaleString();
    }
    
    if (accessType === 'yearly') {
        const yearlyPrice = selectedCurrency === 'USD' ? 336 : 280000;
        return yearlyPrice.toLocaleString();
    }
    
    return amount.toLocaleString();
  };

  const getFinalPrice = () => {
    if (discountInfo) return discountInfo.finalPrice.toLocaleString();
    return getRegularPrice();
  };

  const handleRemoveCoupon = () => {
      setDiscountInfo(null);
      setLocalCoupon("");
      setCouponCode(""); 
      setError(undefined);
  };

    const getNumericPrice = () => {
        let amount = 0;
        if (basePrice) {
            amount = parseFloat(basePrice.replace(/[^0-9.]/g, ""));
        }
        
        if (amount === 0) {
            amount = selectedCurrency === 'USD' ? 30 : 25000;
        }

        if (accessType === 'monthly') {
            return selectedCurrency === 'USD' ? 42 : 35000;
        }
        
        if (accessType === 'yearly') {
            return selectedCurrency === 'USD' ? 336 : 280000;
        }
        
        return amount;
    };

    const handleCouponApply = (data: CouponValidationData, code: string) => {
        setLocalCoupon(code);
        setCouponCode(code);
        setError(undefined);

        const discountPercent = data.discountAmount / data.originalPrice;

        let finalPrice, discount, regularPrice;
        
        if (selectedCurrency === "NGN") {
            regularPrice = data.originalPrice;
            discount = data.discountAmount;
            finalPrice = data.finalPrice;
        } else {
            const usdRegularPrice = getNumericPrice();
            regularPrice = usdRegularPrice;
            discount = usdRegularPrice * discountPercent;
            finalPrice = usdRegularPrice - discount;
        }

        setDiscountInfo({
            discount,
            finalPrice,
            regularPrice,
        });

        // IMPORTANT: Because we decoupled validation from initialization,
        // we must clear any cached checkoutUrl/paymentReference from previous attempts 
        // to force a fresh payment initialization.
        setCheckoutUrl(undefined);
        setPaymentReference(undefined);
    };
  
    const onInitialize = useCallback(async () => {
      if (!contentType || !contentId) {
        setError("Missing content information. Please try again.");
        return;
      }
      
      // Ensure user is loaded
      if (!user) {
          setError("Please log in to enroll.");
          return;
      }
      
      // If we already have a checkout URL (from Apply Coupon), just use it
      if (storeCheckoutUrl && paymentReference) { 
           try {
               window.open(storeCheckoutUrl, "_blank", "noopener,noreferrer");
           } catch {
               router.push(storeCheckoutUrl!);
           }
           return;
      }
  
      
      setError(undefined);
      setIsInitializing(true);
  
      const idempotencyKey = uuidv4();
  
      try {
        checkoutWindowRef.current = window.open("", "_blank");
        const callbackUrl = `${window.location.origin}/payments/verify`;
  
        const userDetails = {
              name: `${user.firstname} ${user.lastname}`,
              email: user.email,
              phone: "0000000000",
        };
  
        // Pass accessType and couponCode
        // Store coupon code in store before calling if valid
        if (localCoupon) {
            setCouponCode(localCoupon);
        }
  
        const res = await initializePayment(
          {
            contentType,
            contentId,
            currency: selectedCurrency,
            callbackUrl,
            userDetails,
            accessType,
            couponCode: localCoupon || undefined,
          },
          idempotencyKey
        );

        // Check if free access was granted (no payment needed)
        if (!res.data) {
          setError("Payment initialization failed - no payment data returned.");
          if (checkoutWindowRef.current) checkoutWindowRef.current.close();
          return;
        }
  
        const url = toAbsoluteUrl(
          res.data.authorizationUrl ?? res.data.checkoutUrl
        );
        if (!url) {
          setError(
            res.message || "No checkout URL returned. Please try another currency."
          );
          if (checkoutWindowRef.current) checkoutWindowRef.current.close();
          return;
        }
        setCheckoutUrl(url);
  
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
        const msg =
          err instanceof Error ? err.message : "Failed to initialize payment.";
        setError(msg);
        if (checkoutWindowRef.current) checkoutWindowRef.current.close();
      } finally {
        setIsInitializing(false);
      }
    }, [
      contentType,
      contentId,
      selectedCurrency,
      accessType,
      localCoupon,
      user,
      setError,
      setIsInitializing,
      setCheckoutUrl,
      setPaymentReference,
      toAbsoluteUrl,
      setCouponCode,
      router,
      storeCheckoutUrl, // Add dep
      paymentReference // Add dep
    ]);

  const onVerify = useCallback(async () => {
    if (!contentType || !contentId) {
      setError("Missing content information. Please try again.");
      return;
    }
    const state = usePaymentStore.getState();
    const reference = state.paymentReference;
    if (!reference) return;

    setError(undefined);
    setIsVerifying(true);

    const idempotencyKey = uuidv4();

    try {
      const res = await verifyPayment(
        reference,
        selectedCurrency,
        idempotencyKey
      );
      if (res.success && res.purchase?.paymentStatus === "success") {
        markContentAsPurchased(contentType, contentId);
        closeEnrollmentModal();
        router.push(`/dashboard/courses/enrollments`);
      } else {
        setError(
          res.message || "Payment could not be verified. Please try again."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying payment.";
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [
    contentType,
    contentId,
    selectedCurrency,
    markContentAsPurchased,
    closeEnrollmentModal,
    router,
    setError,
    setIsVerifying,
  ]);

  if (!isEnrollmentModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeEnrollmentModal}
      />
      <div className="relative z-10 w-[95%] max-w-[500px] max-h-[90vh] bg-[#1F2636] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)] sticky top-0 bg-[#1F2636] z-10">
          <h2 className="text-xl font-bold text-white">Complete Enrollment</h2>
          <button
            onClick={closeEnrollmentModal}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
           {/* Currency Selection */}
           <div className="flex justify-end mb-2">
              <div className="bg-[rgba(255,255,255,0.05)] p-1 rounded-lg flex gap-1">
                 {['NGN', 'USD'].map((c) => (
                    <button
                        key={c}
                        onClick={() => setSelectedCurrency(c)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            selectedCurrency === c
                            ? 'bg-[#6a57e5] text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {c}
                    </button>
                 ))}
              </div>
           </div>
          {/* Access Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Select Access Plan
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => !discountInfo && setAccessType("individual")}
                disabled={!!discountInfo}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  accessType === "individual"
                    ? "bg-[rgba(106,87,229,0.1)] border-[#6a57e5]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]"
                } ${!!discountInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left pr-4">
                  <div
                    className={`font-semibold ${
                      accessType === "individual"
                        ? "text-[#6a57e5]"
                        : "text-white"
                    }`}
                  >
                    Lifetime Access
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    One-time payment for this course 
                  </div>
                </div>
                {accessType === "individual" && (
                  <div className="w-5 h-5 flex-shrink-0 rounded-full bg-[#6a57e5] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => !discountInfo && setAccessType("monthly")}
                disabled={!!discountInfo}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  accessType === "monthly"
                    ? "bg-[rgba(106,87,229,0.1)] border-[#6a57e5]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]"
                } ${!!discountInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left pr-4">
                  <div className={`font-semibold ${accessType === 'monthly' ? 'text-[#6a57e5]' : 'text-white'}`}>
                    Monthly All-Access
                  </div>
                   <div className="text-xs text-gray-400 mt-1">
                    Access to ALL courses (learn at your pace)
                  </div>
                </div>
                {accessType === "monthly" && (
                    <div className="w-5 h-5 flex-shrink-0 rounded-full bg-[#6a57e5] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                    </div>
                )}
              </button>

              <button
                onClick={() => !discountInfo && setAccessType("yearly")}
                disabled={!!discountInfo}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  accessType === "yearly"
                    ? "bg-[rgba(106,87,229,0.1)] border-[#6a57e5]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)]"
                } ${!!discountInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left pr-4">
                  <div className={`font-semibold ${accessType === 'yearly' ? 'text-[#6a57e5]' : 'text-white'}`}>
                    Yearly All-Access
                  </div>
                   <div className="text-xs text-gray-400 mt-1">
                    Best Value: Access to ALL courses
                  </div>
                </div>
                {accessType === "yearly" && (
                    <div className="w-5 h-5 flex-shrink-0 rounded-full bg-[#6a57e5] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                    </div>
                )}
              </button>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-3">
             <CouponInput
                contentType={contentType || ''}
                contentId={contentId || ''}
                selectedCurrency={selectedCurrency}
                onApply={handleCouponApply}
                onRemove={handleRemoveCoupon}
                disabled={isInitializing}
             />
             {discountInfo && (
              <p className="text-green-400 text-xs">
                Coupon applied! You save {selectedCurrency}{" "}
                {discountInfo.discount.toLocaleString()}
              </p>
             )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Summary & Action */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-300">Total</span>
              <div className="text-right">
                {discountInfo && (
                    <span className="block text-sm text-gray-400 line-through">
                        {selectedCurrency} {getRegularPrice()}
                    </span>
                )}
                <span className="text-2xl font-bold text-white">
                  {selectedCurrency} {getFinalPrice()}
                </span>
                {/* <p className="text-xs text-gray-500">Secure payment via Paystack</p> */}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onInitialize}
                disabled={isInitializing || isVerifying || userLoading}
                className="w-full py-4 bg-[#6a57e5] hover:bg-[#5844d6] text-white rounded-full font-bold text-lg transition-all shadow-[0_4px_14px_0_rgba(106,87,229,0.39)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> {userLoading ? 'Loading Profile...' : 'Proceed to Payment'}
                  </>
                )}
              </button>

              {/* Verify Button (Visible only if reference exists, for manual verification loop) */}
              {isInitializing && (
                <button
                    onClick={onVerify}
                    disabled={isVerifying}
                    className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                    {isVerifying ? "Checking status..." : "I've completed payment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
