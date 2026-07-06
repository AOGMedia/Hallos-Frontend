"use client";
import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/store/paymentStore";
import type { PaymentGateway, ContentType } from "@/lib/api/payments";
import { verifyPayment } from "@/lib/api/payments";
import { verifyTopUp } from "@/lib/api/wallet";
import { getVideoById } from "@/lib/api/videos";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWalletBalanceStore } from "@/store";
import { freebiesService } from "@/services/freebiesService";
import { useQueryClient } from "@tanstack/react-query";
import { freebieKeys } from "@/hooks/useFreebies";

type VerifyStatus = "idle" | "verifying" | "success" | "error";

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-darker flex items-center justify-center"><div className="text-text-primary">Loading verification…</div></div>}>
      <VerifyPaymentClient />
    </Suspense>
  );
}

function VerifyPaymentClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { markContentAsPurchased } = usePaymentStore();
  const { userId } = useCurrentUser();
  const { fetchBalance } = useWalletBalanceStore();
  const queryClient = useQueryClient();

  // Extract reference based on gateway
  // Paystack: uses 'ref', 'reference', or 'trxref'
  // Stripe: uses 'session_id'
  const stripeSessionId = params.get("session_id");
  const paystackRef = params.get("ref") ?? params.get("reference") ?? params.get("trxref");
  
  const gatewayParam = (params.get("gateway") as PaymentGateway | null) ?? null;
  const contentTypeParam = (params.get("contentType") as ContentType | null) ?? null;
  const contentIdParam = params.get("contentId") ?? "";

  // Auto-detect gateway if not provided
  // Paystack sends 'trxref', Stripe sends 'session_id'
  const detectedGateway = (gatewayParam ?? 
    (params.get("trxref") ? "paystack" :
     params.get("reference") ? "paystack" :
     params.get("ref") ? "paystack" :
     stripeSessionId ? "stripe" : 
     null)) as PaymentGateway | null;

  // Use appropriate reference based on detected gateway
  const referenceParam = detectedGateway === "stripe" 
    ? (stripeSessionId ?? "") 
    : (paystackRef ?? "");

  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [purchaseInfo, setPurchaseInfo] = useState<{
    amount?: string;
    currency?: string;
    contentType?: ContentType;
    contentId?: string;
    message?: string;
  } | undefined>(undefined);
  const [videoTitle, setVideoTitle] = useState<string | undefined>(undefined);

  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    const ref = referenceParam;
    const gateway = detectedGateway;

    if (!ref || !gateway) {
      return;
    }

    if (processedRef.current === ref) return;
    processedRef.current = ref;

    setStatus("verifying");
    setError(undefined);

    // Get currency from URL params or default based on gateway
    const currency = params.get("currency") || (gateway === "paystack" ? "NGN" : "USD");

    if (contentTypeParam === "freebie") {
      freebiesService.verifyPurchase(contentIdParam, ref, currency)
        .then((res) => {
          if (res.success) {
            markContentAsPurchased("freebie", contentIdParam, userId);
            queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
            queryClient.invalidateQueries({ queryKey: freebieKeys.detail(contentIdParam) });
            setPurchaseInfo({ 
              message: res.message || "Purchase verified. You now have full access.",
              contentType: "freebie",
              contentId: contentIdParam
            });
            setStatus("success");
          } else {
            setError(res.message || "Library item verification failed.");
            setStatus("error");
            processedRef.current = null;
          }
        })
        .catch((err) => {
          console.error("Library verification error:", err);
          setError("Failed to verify library item purchase.");
          setStatus("error");
          processedRef.current = null;
        });
      return;
    }

    // Top-up references always start with "topup_"
    if (ref.startsWith("topup_")) {
      const topUpPayload: { reference: string; gateway: 'paystack' | 'stripe'; sessionId?: string } = {
        reference: ref,
        gateway: gateway as 'paystack' | 'stripe',
      };
      // Stripe requires sessionId in the body
      if (gateway === 'stripe' && stripeSessionId) {
        topUpPayload.sessionId = stripeSessionId;
      }
      verifyTopUp(topUpPayload)
        .then((res) => {
          if (res.success) {
            fetchBalance();
            setPurchaseInfo({ message: res.message, currency: res.transaction?.currency, amount: String(res.transaction?.amount) });
            setStatus("success");
          } else {
            setError(res.message || "Top-up verification failed.");
            setStatus("error");
            processedRef.current = null;
          }
        })
        .catch((err: unknown) => {
          const e = err as { response?: { data?: { message?: string; success?: boolean } }; message?: string };
          const msg = e?.response?.data?.message || e?.message || "Failed to verify top-up.";
          // "already processed" means payment went through — treat as success
          if (msg.toLowerCase().includes("already been processed") || msg.toLowerCase().includes("already processed")) {
            fetchBalance();
            setPurchaseInfo({ message: "Your wallet has been topped up successfully." });
            setStatus("success");
          } else {
            setError(msg);
            setStatus("error");
            processedRef.current = null;
          }
        });
      return;
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID();

    verifyPayment(ref, currency, idempotencyKey)
      .then((res) => {
        if (res.success) {
          const p = res.purchase;
          if (p) {
            markContentAsPurchased(p.contentType, p.contentId, userId);
            // If it's a freebie, invalidate the freebie cache so purchased: true is reflected immediately
            if (p.contentType === 'freebie') {
              queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
              queryClient.invalidateQueries({ queryKey: freebieKeys.detail(p.contentId) });
            }
          }
          setPurchaseInfo({
            amount: p?.amount,
            currency: p?.currency,
            contentType: p?.contentType,
            contentId: p?.contentId,
            message: res.message,
          });
          setStatus("success");
        } else {
          setError(res.message || "Verification failed.");
          setStatus("error");
          processedRef.current = null;
        }
      })
      .catch(() => {
        setError("Failed to verify payment.");
        setStatus("error");
        processedRef.current = null;
      });
  }, [referenceParam, detectedGateway, stripeSessionId, markContentAsPurchased, params, userId, fetchBalance, contentIdParam, contentTypeParam, queryClient]);

  useEffect(() => {
    if (status !== "success") return;

    const ct = purchaseInfo?.contentType ?? contentTypeParam ?? "video";
    const cid = purchaseInfo?.contentId ?? contentIdParam ?? "";

    if (ct === "video" && cid) {
      getVideoById(cid)
        .then((v) => setVideoTitle(v.title))
        .catch(() => void 0);
    }
  }, [status, purchaseInfo, contentTypeParam, contentIdParam]);

  const amountLabel = useMemo(() => {
    const c = purchaseInfo?.currency ?? "";
    const a = purchaseInfo?.amount ?? "";
    return [c, a].filter(Boolean).join(" ");
  }, [purchaseInfo]);

  const onStartWatching = () => {
    const ct = purchaseInfo?.contentType ?? contentTypeParam ?? "video";
    const cid = purchaseInfo?.contentId ?? contentIdParam ?? "";
    
    // Top-up success — go to wallet
    if (!ct || (!purchaseInfo?.contentType && !contentTypeParam)) {
      router.push("/dashboard/wallet");
      return;
    }

    // Route based on content type
    if (ct === "video" && cid) {
      router.push(`/dashboard/video/${cid}`);
    } else if (ct === "course") {
      router.push("/dashboard/courses/enrollments");
    } else if (ct === "live_class" && cid) {
      router.push(`/live/join/${cid}`);
    } else if (ct === "live_series" && cid) {
      router.push(`/series/${cid}?payment=success`);
    } else if (ct === "freebie") {
      router.push("/dashboard/freebies");
    } else {
      router.push("/dashboard");
    }
  };

  const onBack = () => router.push("/dashboard");

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-regular hover:opacity-80"
            aria-label="Back to dashboard"
          >
            Back to dashboard
          </button>
          <div className="text-muted-small">Payments • Verification</div>
        </div>

        <div className="rounded-2xl bg-[rgba(234,234,234,0.06)] p-6 backdrop-blur-[60px]">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3 text-text-primary">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-medium font-semibold">Verifying your payment…</div>
              <div className="text-description">Please wait while we confirm your purchase.</div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 text-accent-red">
              <div className="text-medium font-semibold">Verification failed</div>
              
              <div className="text-description text-center">{error}</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.refresh()}
                  className="px-6 py-[12px] rounded-full bg-primary text-white hover:opacity-90"
                >
                  Retry
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-[12px] rounded-full border border-[rgba(106,87,229,1)] bg-[rgba(106,87,229,0.01)] hover:bg-[rgba(106,87,229,0.05)] text-[#eaeaea]"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 text-text-primary">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 13.5L4 10l1.5-1.5L7.5 10.5l7-7L16 5l-8.5 8.5z" fill="white" />
                </svg>
              </div>
              <div className="text-medium font-semibold text-center">Payment verified</div>
              <div className="text-description text-center">
                {!purchaseInfo?.contentType && !contentTypeParam
                  ? purchaseInfo?.message || "Your wallet has been topped up successfully."
                  : purchaseInfo?.contentType === "course" 
                    ? "Thank you for your payment! Course access details will be sent to your email shortly."
                    : amountLabel 
                      ? `You purchased this content for ${amountLabel}.` 
                      : "You have successfully purchased this content."}
              </div>
              
              
              {videoTitle && (
                <div className="text-muted-small">{videoTitle}</div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={onStartWatching}
                  className="px-6 py-[12px] rounded-full bg-primary text-white hover:opacity-90"
                >
                  {!purchaseInfo?.contentType && !contentTypeParam
                    ? "Go to Wallet"
                    : purchaseInfo?.contentType === "course" 
                      ? "View My Enrollments" 
                      : purchaseInfo?.contentType === "live_class"
                      ? "Join Live Class"
                      : purchaseInfo?.contentType === "freebie"
                      ? "Go to Library"
                      : purchaseInfo?.contentType === "live_series"
                      ? "View Series"
                      : "Start Watching"}
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-[12px] rounded-full border border-[rgba(106,87,229,1)] bg-[rgba(106,87,229,0.01)] hover:bg-[rgba(106,87,229,0.05)] text-[#eaeaea]"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

