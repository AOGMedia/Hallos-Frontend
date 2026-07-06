"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { initializePayment } from "@/lib/api/payments";
import { v4 as uuidv4 } from "uuid";
import { Loader2, CreditCard } from "lucide-react";
import { usePaymentStore } from "@/store/paymentStore";
import { CouponInput } from "@/components/checkout/CouponInput";
import type { CouponValidationData } from "@/types/coupon";

interface SeriesPricingCardProps {
  seriesId: string;
  seriesTitle: string;
  pricing?: {
    base: { amount: number; currency: string };
    ngn: number;
    usd: number;
  };
  isCreator: boolean;
  hasAccess: boolean;
  isFree: boolean;
  user: {
    id: string | number;
    firstname: string;
    lastname: string;
    email: string;
  } | null;
  onSuccess: () => void;
  onManage: () => void;
  isRegistered?: boolean;
  registering?: boolean;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
}

interface CouponResult {
  discountAmount: number;
  finalPrice: number;
  regularPrice: number;
  currency: string;
  code: string;
}

export function SeriesPricingCard({
  seriesId,
  pricing,
  isCreator,
  hasAccess,
  isFree,
  user,
  onSuccess,
  onManage,
  isRegistered = false,
  registering = false,
  onRegister,
  onCancelRegistration,
}: SeriesPricingCardProps) {
  const router = useRouter();
  const { markContentAsPurchased } = usePaymentStore();
  const [selectedCurrency, setSelectedCurrency] = useState<"NGN" | "USD">("NGN");
  const [couponCode, setCouponCode] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>();
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const checkoutWindowRef = useRef<Window | null>(null);

  // Removed auto-pre-fill of 'SAVEBIG10' from localStorage promo ref

  const regularPrice = couponResult?.regularPrice
    ?? (pricing ? (selectedCurrency === "NGN" ? pricing.ngn : pricing.usd) : 0);
  const finalPrice = couponResult?.finalPrice ?? regularPrice;
  const isFreeWithCoupon = couponResult !== null && finalPrice === 0;

  const formatPrice = (amount: number) => {
    const activeCurrency = couponResult?.currency || selectedCurrency;
    const symbol = activeCurrency === "NGN" ? "₦" : "$";
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCurrencyChange = (currency: "NGN" | "USD") => {
    if (couponResult) setCouponResult(null);
    setSelectedCurrency(currency);
  };

  const handleCouponApply = (data: CouponValidationData, code: string) => {
    setCouponCode(code);

    const serverCurrency = (data.currency || selectedCurrency) as "NGN" | "USD";
    let discountAmount = data.discountAmount;
    let finalPrice = data.finalPrice;
    let regularPrice = data.originalPrice;

    // If server returned USD but user is viewing NGN, convert using pricing object
    if (serverCurrency === 'USD' && selectedCurrency === 'NGN' && pricing && pricing.ngn > 0) {
      const discountPercent = data.discountAmount / data.originalPrice;
      regularPrice = pricing.ngn;
      discountAmount = Math.round(regularPrice * discountPercent);
      finalPrice = regularPrice - discountAmount;
    }
    // If server returned NGN but user is viewing USD, convert using pricing object
    else if (serverCurrency === 'NGN' && selectedCurrency === 'USD' && pricing && pricing.usd > 0) {
      const discountPercent = data.discountAmount / data.originalPrice;
      regularPrice = pricing.usd;
      discountAmount = Math.round(regularPrice * discountPercent * 100) / 100;
      finalPrice = Math.round((regularPrice - discountAmount) * 100) / 100;
    }

    setCouponResult({
      discountAmount,
      finalPrice,
      regularPrice,
      currency: selectedCurrency,
      code,
    });
  };

  const handleCouponRemove = () => {
    setCouponResult(null);
    setCouponCode("");
  };

  const handlePurchase = useCallback(async () => {
    if (hasAccess) {
      setPaymentError("You already have access to this series!");
      return;
    }
    if (!user) {
      setPaymentError("Redirecting to login...");
      setTimeout(() => router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`), 800);
      return;
    }

    setPaymentError(undefined);
    setIsInitializing(true);
    const idempotencyKey = uuidv4();

    try {
      const referralCode = typeof window !== "undefined" ? localStorage.getItem("hallos-promo-ref") : null;
      const res = await initializePayment(
        {
          contentType: "live_series",
          contentId: seriesId,
          currency: selectedCurrency,
          userDetails: {
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            phone: "0000000000",
          },
          couponCode: couponCode || undefined,
          ...(referralCode && { referralCode, metadata: { referralCode } }),
        },
        idempotencyKey,
      );

      if (res.success && (res.freeAccess || res.couponApplied || !res.data)) {
        markContentAsPurchased("live_series", seriesId, user?.id?.toString());
        onSuccess();
        return;
      }

      checkoutWindowRef.current = window.open("", "_blank");
      const url = res.data?.authorizationUrl ?? res.data?.checkoutUrl;

      if (!url) {
        setPaymentError(res.message || "No checkout URL returned. Please try again.");
        checkoutWindowRef.current?.close();
        return;
      }

      if (checkoutWindowRef.current) {
        checkoutWindowRef.current.location.assign(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err: unknown) {
      let msg = "Failed to initialize payment.";
      if (err && typeof err === "object" && "response" in err) {
        msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      if (msg.toLowerCase().includes("already purchased")) {
        if (user?.id) markContentAsPurchased("live_series", seriesId, user.id.toString());
        setPaymentError("Great news! You already have access to this series. Refreshing...");
        setTimeout(() => onSuccess(), 1000);
      } else {
        setPaymentError(msg);
      }
      checkoutWindowRef.current?.close();
    } finally {
      setIsInitializing(false);
    }
  }, [hasAccess, user, seriesId, selectedCurrency, couponCode, router, onSuccess, markContentAsPurchased]);

  return (
    <div className="bg-background-card p-6 rounded-lg">
      <div className="flex flex-col gap-4">

        {/* Currency Toggle */}
        {pricing && !isFree && (
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-sm">Currency</p>
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              {(["NGN", "USD"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedCurrency === curr
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-white hover:bg-white/10"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Display */}
        <div>
          <p className="text-text-muted text-sm mb-1">Series Price</p>
          {couponResult && couponResult.discountAmount > 0 && (
            <p className="text-lg text-text-muted line-through">{formatPrice(regularPrice)}</p>
          )}
          <p className="text-3xl font-bold text-text-primary">
            {isFree ? "Free"
              : isFreeWithCoupon ? <span className="text-green-400">FREE</span>
              : pricing ? formatPrice(finalPrice)
              : "Free"}
          </p>
          {isFree && <p className="text-sm text-green-400 mt-1">Free Series</p>}
          {couponResult && couponResult.discountAmount > 0 && !isFreeWithCoupon && (
            <p className="text-xs text-green-400 mt-1">
              ✓ Saving {couponResult.currency === 'NGN' ? '₦' : '$'}{couponResult.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isCreator ? (
          <Button variant="primary" onClick={onManage} className="w-full">
            Manage Series
          </Button>
        ) : isFree && onRegister ? (
          /* ── Free series registration flow ── */
          <div className="flex flex-col gap-2">
            {isRegistered ? (
              <>
                <Button
                  variant="secondary"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-green-500/10 border-2 border-green-500/50 text-green-400 cursor-default hover:bg-green-500/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Spot Secured ✓
                </Button>
                <p className="text-xs text-green-400/80 text-center">You&apos;re registered for this series</p>
                {onCancelRegistration && (
                  <button
                    onClick={onCancelRegistration}
                    disabled={registering}
                    className="text-xs text-text-muted hover:text-red-400 transition-colors text-center underline"
                  >
                    {registering ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                )}
                <Button variant="primary" onClick={() => router.push(`/series/${seriesId}#sessions`)} className="w-full mt-2">
                  View Sessions
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={onRegister}
                disabled={registering}
                className="w-full flex items-center justify-center gap-2"
              >
                {registering ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
                ) : (
                  'Secure My Spot'
                )}
              </Button>
            )}
          </div>
        ) : hasAccess ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              disabled
              className="w-full flex items-center justify-center gap-2 bg-green-500/10 border-2 border-green-500/50 text-green-400 cursor-default hover:bg-green-500/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              PURCHASED
            </Button>
            <Button variant="primary" onClick={() => router.push(`/series/${seriesId}#sessions`)} className="w-full">
              View Sessions
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handlePurchase}
              disabled={isInitializing}
              className="w-full flex items-center justify-center gap-2"
            >
              {isInitializing ? (
                <><Loader2 className="animate-spin" size={20} /> Processing...</>
              ) : (
                <><CreditCard size={20} />{isFreeWithCoupon || isFree ? "Get Free Access" : "Purchase Series"}</>
              )}
            </Button>

            {!isFree && !isInitializing && (
              <p className="text-xs text-text-muted text-center">
                Already paid?{" "}
                <button onClick={handlePurchase} className="text-primary hover:underline">
                  Click here to verify your access
                </button>
              </p>
            )}

            {paymentError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{paymentError}</p>
              </div>
            )}

            {/* Coupon Section */}
            {!isFree && (
              <CouponInput
                contentType="live_series"
                contentId={seriesId}
                selectedCurrency={selectedCurrency}
                onApply={handleCouponApply}
                onRemove={handleCouponRemove}
                disabled={isInitializing}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
