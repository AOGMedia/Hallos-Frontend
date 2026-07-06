"use client";

import React, { useEffect, Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { AnimatedTicket } from "@/components/ui/AnimatedTicket";
import { toPng } from "html-to-image";

// Define interface for campaign verify payment response
interface CampaignVerifyPaymentResponse {
  success: boolean;
  message: string;
  registration?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    paymentStatus: string;
  };
  alreadyProcessed?: boolean;
}

type VerifyStatus = "idle" | "verifying" | "success" | "error";

function CampaignSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("reference") || params.get("trxref");
  const ticketRef = useRef<HTMLDivElement>(null); // for display and capture
  
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [data, setData] = useState<CampaignVerifyPaymentResponse | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // No reference: redirect back to registration (or home/campaign register)
    if (!reference) {
      router.push("/");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      setError(undefined);
      try {
        const res = await apiClient.get<CampaignVerifyPaymentResponse>(
          `/api/payments/verify/${encodeURIComponent(reference)}`,
          { params: { currency: "NGN" } }
        );
        if (res.data.success) {
          setData(res.data);
          setStatus("success");
        } else {
          setError(res.data.message || "Payment failed, please try again.");
          setStatus("error");
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        setError(axiosErr.response?.data?.message || axiosErr.message || "Payment verification failed.");
        setStatus("error");
      }
    };

    verify();
  }, [reference, router]);

  const onDownloadReceipt = async () => {
    if (!ticketRef.current || !reference) return;

    setIsDownloading(true);
    // Wait a little for React to render the ticket without the button
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(ticketRef.current, {
        backgroundColor: "#1f2636",
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `hallos-career-ignite-receipt-${reference}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download receipt:", err);
      alert("Failed to download receipt. Please try again or take a screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  const onBackToEvents = () => {
    router.push("/dashboard/events");
  };
  
  const onBackToRegister = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#1f2636] flex flex-col items-center justify-center p-4 gap-8 relative">
      {status === "verifying" ? (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-[#6A57E5] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
          <p className="text-[#888C94]">Please wait while we confirm your spot for Hallos Millionaires Retreat – 2026.</p>
        </div>
      ) : status === "success" && data && data.registration ? (
        <>
          {/* Main Ticket */}
          <div ref={ticketRef}>
            <AnimatedTicket
              ticketId={data.registration.id}
              amount="₦3,000.00"
              date={new Date()}
              name={`${data.registration.firstName} ${data.registration.lastName}`}
              email={data.registration.email}
              barcodeValue={reference || data.registration.id}
              onDownloadReceipt={onDownloadReceipt}
              isForDownload={isDownloading}
            />
          </div>
          <button
            onClick={onBackToEvents}
            className="text-[#888C94] hover:text-white transition-colors"
          >
            Back to Events
          </button>
        </>
      ) : status === "error" ? (
        <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
           <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
            <p className="text-[#888C94] font-medium">
              {error || "Payment failed, please try again"}
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
             <Button 
              variant="primary" 
              size="lg" 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-[#6A57E5] hover:bg-[#6A57E5]/90 rounded-full font-bold text-lg"
             >
               Retry Verification
             </Button>
             <button 
              onClick={onBackToRegister}
              className="text-[#888C94] hover:text-white transition-colors"
             >
               Back to Registration
             </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CampaignSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1f2636] flex items-center justify-center text-white font-bold">Loading...</div>}>
      <CampaignSuccessContent />
    </Suspense>
  );
}
