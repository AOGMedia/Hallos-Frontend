"use client";

import { LiveClass } from "@/services/liveClassService";
import { CouponInput } from "@/components/checkout/CouponInput";
import { CouponValidationData } from "@/types/coupon";
import { Button } from "@/components/ui/Button";
import RedDotIcon from "@/components/icons/RedDotIcon";

interface CouponResult {
  discountAmount: number;
  finalPrice: number;
  regularPrice: number;
  currency: string;
  code: string;
}

interface LobbyDetailsCardProps {
  liveClass: LiveClass;
  isLive: boolean;
  isEnded: boolean;
  isRecorded: boolean;
  isScheduled: boolean;
  joining: boolean;
  hasPaid: boolean;
  isRegistered: boolean;
  registering: boolean;
  couponResult: CouponResult | null;
  onJoin: () => void;
  onRegister: () => void;
  onCancelRegistration: () => void;
  onCouponApply: (data: CouponValidationData, code: string) => void;
  onCouponRemove: () => void;
}

export default function LobbyDetailsCard({
  liveClass,
  isLive,
  isEnded,
  isRecorded,
  isScheduled,
  joining,
  hasPaid,
  isRegistered,
  registering,
  couponResult,
  onJoin,
  onRegister,
  onCancelRegistration,
  onCouponApply,
  onCouponRemove,
}: LobbyDetailsCardProps) {
  const isFreeClass = Number(liveClass.price) === 0;
  return (
    <div className="bg-background-dark rounded-2xl border border-border/10 overflow-hidden">
      {/* Thumbnail Header */}
      {liveClass.thumbnailUrl && (
        <div className="w-full h-64 relative overflow-hidden bg-background-dark/50">
          {/* Blurred background to fill side gaps */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={liveClass.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm brightness-100"
            aria-hidden="true"
          />
          {/* Main image centered on top */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={liveClass.thumbnailUrl}
            alt={liveClass.title}
            className="absolute inset-0 w-full h-full object-contain z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-20" />
        </div>
      )}

      <div className="p-8 flex flex-col gap-8">
        {/* Title, Badges & Description */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <h1 className="text-3xl font-bold text-text-primary">
              {liveClass.title}
            </h1>
            {isLive && (
              <span className="px-3 py-1 bg-accent-red/20 text-accent-red text-sm font-bold rounded-full flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                LIVE
              </span>
            )}
            {isEnded && (
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm font-bold rounded-full shrink-0">
                ENDED
              </span>
            )}
            {isRecorded && (
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full shrink-0">
                RECORDED
              </span>
            )}
            {isScheduled && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm font-bold rounded-full shrink-0">
                SCHEDULED
              </span>
            )}
          </div>
          <p className="text-text-primary/80 text-lg leading-relaxed">
            {liveClass.description || "No description provided."}
          </p>
        </div>

        {/* Pricing, Host & Time Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-background-dark/50 rounded-xl border border-border/10">
            <p className="text-text-primary/40 text-sm mb-1">Price</p>
            <div className="flex flex-col">
              {couponResult && couponResult.discountAmount > 0 && (
                <span className="text-sm text-text-primary/40 line-through">
                  {couponResult.currency === "NGN" ? "₦" : "$"}{couponResult.regularPrice.toLocaleString()}
                </span>
              )}
              <span className="text-text-primary font-bold text-lg">
                {Number(liveClass.price) === 0
                  ? "FREE"
                  : couponResult !== null && couponResult.finalPrice === 0
                  ? "FREE"
                  : `${couponResult?.currency || liveClass.currency || "NGN"} ${
                      couponResult ? couponResult.finalPrice.toLocaleString() : Number(liveClass.price).toLocaleString()
                    }`}
              </span>
              {couponResult && couponResult.discountAmount > 0 && (
                <span className="text-xs text-green-400 mt-1">
                  ✓ Saving {couponResult.currency === "NGN" ? "₦" : "$"}{couponResult.discountAmount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 bg-background-dark/50 rounded-xl border border-border/10">
            <p className="text-text-primary/40 text-sm mb-1">Host</p>
            <p className="text-text-primary font-bold text-lg">
              {liveClass.creatorName || "Instructor"}
            </p>
          </div>
          <div className="p-4 bg-background-dark/50 rounded-xl border border-border/10 sm:col-span-2">
            <p className="text-text-primary/40 text-sm mb-1">Scheduled Time</p>
            <p className="text-text-primary font-bold text-lg">
              {liveClass.createdAt && new Date(liveClass.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Coupon Input Section */}
        {!hasPaid && Number(liveClass.price) > 0 && (
          <CouponInput
            contentType="live_class"
            contentId={liveClass.id}
            selectedCurrency={liveClass.currency || "NGN"}
            onApply={onCouponApply}
            onRemove={onCouponRemove}
            disabled={joining}
          />
        )}

        {/* Action Button & Informative Messages */}
        <div className="flex flex-col gap-4">
          {/* Main Action Button */}
          {isScheduled && isFreeClass && !isRegistered ? (
            <Button
              variant="outline"
              size="md"
              className="w-full flex justify-center text-xl font-bold text-center items-center"
              onClick={onRegister}
              disabled={registering}
            >
              <span>
                <RedDotIcon width={24} height={24} className="sm:w-[43px] sm:h-[43px] text-red-600" />
              </span>
              <span>{registering ? "Securing..." : "Secure My Spot"}</span>
            </Button>
          ) : isScheduled && isFreeClass && isRegistered ? (
            <Button
              variant="outline"
              size="md"
              className="w-full flex justify-center text-xl font-bold text-center items-center border-green-500/30 text-green-400"
              disabled
            >
              <span className="text-green-400">✓</span>
              <span>Spot Secured</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              className="w-full flex justify-center text-xl font-bold text-center items-center"
              onClick={onJoin}
              disabled={joining || (!isLive && !isScheduled)}
            >
              <span>
                {!isLive ? (
                  <RedDotIcon width={24} height={24} className="sm:w-[43px] sm:h-[43px] text-red-600" />
                ) : (
                  <RedDotIcon width={24} height={24} className="sm:w-[43px] sm:h-[43px] text-red-600 animate-pulse" />
                )}
              </span>
              <span>
                {isLive
                  ? joining
                    ? "Joining Room..."
                    : "Join Live Session"
                  : isEnded
                  ? "Session Ended"
                  : isRecorded
                  ? "View Recording"
                  : isScheduled
                  ? joining
                    ? "Processing..."
                    : hasPaid
                    ? "Paid (Waiting for host to start)"
                    : "Register & Pay"
                  : "Session Not Started"}
              </span>
            </Button>
          )}

          {/* Cancel Registration link for free registered users */}
          {isScheduled && isFreeClass && isRegistered && (
            <button
              onClick={onCancelRegistration}
              disabled={registering}
              className="text-center text-sm text-text-primary/40 hover:text-red-400 transition-colors"
            >
              {registering ? "Cancelling..." : "Cancel Registration"}
            </button>
          )}

          {isScheduled && (
            <p className="text-center text-sm text-text-primary/60 italic">
              {isFreeClass && isRegistered
                ? "You're registered! You will receive a reminder before the class starts."
                : "This session is scheduled but not yet active. Please check back at the scheduled time."}
            </p>
          )}
          {isEnded && (
            <p className="text-center text-sm text-text-primary/60 italic">
              This live session has ended. Thank you for your interest!
            </p>
          )}
          {isRecorded && (
            <p className="text-center text-sm text-text-primary/60 italic">
              This session has been recorded. Click the button above to watch the recording.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
