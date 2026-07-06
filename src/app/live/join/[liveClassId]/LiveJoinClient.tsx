"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { getLiveClass, LiveClass, LiveStatus, registerLiveClass, cancelLiveClassRegistration } from "@/services/liveClassService";
import { joinZegoRoom } from "@/services/zegoService";
import { joinSession, getSessionDetails } from "@/services/sessionService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { usePaymentStore } from "@/store/paymentStore";
import { Share2, Check, ArrowLeft } from "lucide-react";
import { checkAccess, initializePayment } from "@/lib/api/payments";
import LobbyDetailsCard from "./components/LobbyDetailsCard";
import type { CouponValidationData } from "@/types/coupon";

interface CouponResult {
  discountAmount: number;
  finalPrice: number;
  regularPrice: number;
  currency: string;
  code: string;
}

export default function ZegoJoinPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.liveClassId as string;
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const isSeries = pathname.includes("/series-session/");

  const { setContent, setPriceCurrency, openModal, setCouponCode: setCouponCodeStore } = usePaymentStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [joining, setJoining] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/signin?redirect=" + encodeURIComponent(pathname));
    }
  }, [user, userLoading, router, pathname]);

  const loadClass = useCallback(async () => {
    try {
      setLoading(true);
      let lc: LiveClass;

      if (isSeries) {
        try {
          const session = await getSessionDetails(id);
          lc = {
            id: session.id,
            title: session.series
              ? `${session.series.title} - Session ${session.sessionNumber}`
              : `Session ${session.sessionNumber}`,
            description: session.series?.description,
            thumbnailUrl: session.series?.thumbnailUrl,
            status: session.status === "cancelled" ? "ended" : (session.status as LiveStatus),
            price: session.series?.price,
            currency: session.series?.currency,
            userId: session.series?.userId,
            creatorName: session.series?.creator
              ? `${session.series.creator.firstname} ${session.series.creator.lastname}`
              : "Instructor",
            isRegistered: (session.series as { isRegistered?: boolean })?.isRegistered || (session as { isRegistered?: boolean })?.isRegistered || false,
          };
        } catch (err) {
          throw err;
        }
      } else {
        lc = await getLiveClass(id);
      }

      let hasUserPaid = true;
      if (Number(lc.price) > 0) {
        if (user && String(lc.userId) !== String(user.id)) {
          try {
            const contentTypeToCheck = isSeries ? "live_series" : "live_class";
            const access = await checkAccess(contentTypeToCheck, id);
            hasUserPaid = access.hasAccess;
          } catch {
            hasUserPaid = false;
          }
        } else if (!user) {
          hasUserPaid = false;
        }
      }

      setLiveClass(lc);
      setHasPaid(hasUserPaid);
      setIsRegistered(!!lc.isRegistered);

      // Redirect owner to host page
      if (user && String(lc.userId) === String(user.id)) {
        const hostRoute = isSeries ? `/live/host-zego/${id}?type=series` : `/live/host-zego/${id}`;
        router.replace(hostRoute);
        return;
      }
    } catch (e: unknown) {
      const error = e as Error & { response?: { status?: number; data?: { price?: string | number; title?: string; description?: string; currency?: string; message?: string } } };

      const isPaymentError =
        error.response?.status === 402 ||
        error.message?.toLowerCase().includes("payment required") ||
        error.response?.data?.message?.toLowerCase().includes("payment required");

      if (isPaymentError) {
        const minimalClass: LiveClass = {
          id: id,
          title: error.response?.data?.title || "Live Class",
          description: error.response?.data?.description || "",
          price: error.response?.data?.price || 0,
          currency: error.response?.data?.currency || "NGN",
          status: "live",
        };
        setLiveClass(minimalClass);
        setHasPaid(false);
        return;
      }

      setError(error.message || "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [id, user, router, isSeries]);

  useEffect(() => {
    if (id && !userLoading) loadClass();
  }, [id, userLoading, loadClass]);

  const handleRegister = async () => {
    if (!user || !liveClass) return;
    setRegistering(true);
    try {
      await registerLiveClass(id);
      setIsRegistered(true);
    } catch (e: unknown) {
      const err = e as Error & { message?: string };
      // 409 means already registered
      if (err.message?.includes("already secured")) {
        setIsRegistered(true);
      } else {
        setError(err.message || "Failed to register");
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !liveClass) return;
    setRegistering(true);
    try {
      await cancelLiveClassRegistration(id);
      setIsRegistered(false);
    } catch (e: unknown) {
      const err = e as Error & { message?: string };
      setError(err.message || "Failed to cancel registration");
    } finally {
      setRegistering(false);
    }
  };

  const handleCouponApply = (data: CouponValidationData, code: string) => {
    setCouponCode(code);
    setCouponCodeStore(code);
    setPriceCurrency(String(data.finalPrice), data.currency || "NGN");
    setCouponResult({
      discountAmount: data.discountAmount,
      finalPrice: data.finalPrice,
      regularPrice: data.originalPrice,
      currency: data.currency || "NGN",
      code,
    });
  };

  const handleCouponRemove = () => {
    setCouponResult(null);
    setCouponCode("");
    setCouponCodeStore(undefined);
    if (liveClass) {
      setPriceCurrency(String(liveClass.price), liveClass.currency || "NGN");
    }
  };

  const handleJoin = async () => {
    if (!user) return;

    // Check if free via coupon
    const isFreeWithCoupon = couponResult !== null && couponResult.finalPrice === 0;
    if (isFreeWithCoupon) {
      try {
        setJoining(true);
        const idempotencyKey = crypto.randomUUID();
        const res = await initializePayment(
          {
            contentType: isSeries ? "live_series" : "live_class",
            contentId: id,
            currency: liveClass?.currency || "NGN",
            userDetails: {
              name: `${user.firstname} ${user.lastname}`,
              email: user.email,
              phone: "0000000000",
            },
            couponCode: couponCode || undefined,
          },
          idempotencyKey
        );

        if (res.success && (res.freeAccess || res.couponApplied || !res.data)) {
          const { markContentAsPurchased } = usePaymentStore.getState();
          markContentAsPurchased(isSeries ? "live_series" : "live_class", id, user.id.toString());
          window.location.reload();
          return;
        }
      } catch (err) {
        console.error("Failed to apply free coupon:", err);
        setError("Failed to apply free coupon. Please try again.");
      } finally { setJoining(false); }
      return;
    }

    if (isSeries) {
      try {
        setJoining(true);
        const response = await joinSession(id);
        if (response.success) {
          router.push(`/live/${id}/room?type=series`);
        } else {
          setError(response.message || "Failed to join session");
        }
      } catch (e: unknown) {
        const error = e as { response?: { data?: { message?: string } }; message?: string };
        const errorMsg = error.response?.data?.message || error.message || "Failed to join session";
        if (errorMsg.includes("402") || errorMsg.includes("payment") || errorMsg.includes("purchase")) {
          setError("Please purchase this series to join sessions");
        } else if (errorMsg.includes("403") || errorMsg.includes("access")) {
          setError("You do not have access to this session");
        } else {
          setError(errorMsg);
        }
      } finally {
        setJoining(false);
      }
      return;
    }

    try {
      setJoining(true);
      const res = await joinZegoRoom(id, "participant");
      if (res.action === "JOIN") {
        router.push(`/live/${id}/room`);
      } else if (res.action === "PAY") {
        const priceToUse = String(couponResult ? couponResult.finalPrice : res.data.amount || liveClass?.price || "0");
        const currencyToUse = couponResult?.currency || liveClass?.currency || "NGN";
        setPriceCurrency(priceToUse, currencyToUse);
        setContent("live_class", id);
        openModal();
      } else if (res.action === "INVITE") {
        setError("This class requires an invitation code.");
      }
    } catch (e: unknown) {
      console.error("Join Error:", e);
      interface ErrorResponse {
        message?: string;
        requiresPayment?: boolean;
        price?: string | number;
        amount?: string | number;
        currency?: string;
      }
      const error = e as Error & { response?: { data?: ErrorResponse; status?: number } };
      const errorData = error.response?.data || ({} as ErrorResponse);
      const errorMsg = String(errorData.message || error.message || "Failed to join session");

      const isPaymentRequired = errorData.requiresPayment === true || error.response?.status === 402;
      const isPaymentErrorText =
        errorMsg.toLowerCase().includes("paid content") || errorMsg.toLowerCase().includes("payment required");

      if (isPaymentRequired || isPaymentErrorText) {
        setJoining(false);
        const priceToUse = couponResult
          ? couponResult.finalPrice
          : errorData.price || errorData.amount || liveClass?.price || "0";
        const currency = couponResult?.currency || errorData.currency || liveClass?.currency || "NGN";
        setPriceCurrency(String(priceToUse), currency);
        setContent("live_class", id);
        openModal();
        return;
      }
      setError(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center text-text-primary">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  if (error || !liveClass) {
    return (
      <div className="min-h-screen bg-background-darker flex flex-col items-center justify-center text-text-primary gap-4">
        <p className="text-xl font-bold">{error || "Class not found"}</p>
        <Link
          href="/dashboard/schedule"
          className="px-6 py-3 bg-primary text-white rounded-full flex items-center gap-2 hover:opacity-90 transition-all font-semibold"
        >
          <ArrowLeft size={20} className=""/> Back
        </Link>
      </div>
    );
  }

  const isLive = liveClass.status === "live";
  const isEnded = liveClass.status === "ended";
  const isRecorded = liveClass.status === "recorded";
  const isScheduled = liveClass.status === "scheduled";

  return (
    <>
      <div className="min-h-screen bg-background-darker text-text-primary py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/schedule"
              className="flex items-center gap-2 text-text-primary hover:opacity-80 transition-all text-lg"
            >
              <ArrowLeftIcon className="w-4 h-4"/> Back 
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10 transition-all"
            >
              {shareCopied ? (
                <>
                  <Check size={16} className="text-green-400" /> Copied!
                </>
              ) : (
                <>
                  <Share2 size={16} /> Share class
                </>
              )}
            </button>
          </div>

          <LobbyDetailsCard
            liveClass={liveClass}
            isLive={isLive}
            isEnded={isEnded}
            isRecorded={isRecorded}
            isScheduled={isScheduled}
            joining={joining}
            hasPaid={hasPaid}
            isRegistered={isRegistered}
            registering={registering}
            couponResult={couponResult}
            onJoin={handleJoin}
            onRegister={handleRegister}
            onCancelRegistration={handleCancelRegistration}
            onCouponApply={handleCouponApply}
            onCouponRemove={handleCouponRemove}
          />
        </div>
      </div>
      <PaymentModal />
    </>
  );
}
