"use client";

import { useEffect, useCallback } from "react";
import { X, Share2 } from "lucide-react";
import { PROMO, handleShare } from "./promoData";
import Image from "next/image";

interface PromoModalProps {
  onClose: () => void;
}

const MODAL_BG =
  "linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636";

export function PromoModal({ onClose }: PromoModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={PROMO.headline}
    >
      <div
        className="relative w-full max-w-[800px] rounded-3xl overflow-hidden"
        style={{ background: MODAL_BG, minHeight: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative: parachute top-left */}
        <img
          src="/images/promo-parachute.png"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute left-4 top-16 w-14 h-14 sm:w-[65px] sm:h-[64px] object-contain pointer-events-none"
        />

        {/* Decorative: parachute top-right (blurred) */}
        <img
          src="/images/promo-parachute.png"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute right-12 top-20 w-20 h-20 sm:w-[100px] sm:h-[110px] object-contain pointer-events-none opacity-70"
          style={{ filter: "blur(3px)" }}
        />

        {/* Decorative: coins top-right */}
        <img
          src="/images/promo-coins.png"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute right-6 top-[220px] sm:top-[250px] w-10 h-10 sm:w-[50px] sm:h-[50px] object-contain pointer-events-none"
        />

        {/* Decorative: parachute bottom-left */}
        <img
          src="/images/promo-parachute.png"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute left-0 bottom-10 w-20 h-24 sm:w-[110px] sm:h-[130px] object-contain pointer-events-none"
        />

        {/* Decorative: percent sign */}
        <img
          src="/images/promo-percent.png"
          loading="lazy"
          alt=""
          aria-hidden="true"
          className="absolute left-[24%] top-[35%] sm:top-[38%] w-28 h-28 sm:w-[170px] sm:h-[170px] object-contain pointer-events-none"
        />

        {/* Decorative: gift box */}
        <img
          src="/images/promo-gift.png"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute right-[10%] top-[30%] sm:right-[20%] sm:top-[24%] w-36 h-36 sm:w-[280px] sm:h-[280px] object-contain pointer-events-none"
        />

        {/* Logo top-left */}
        <div className="absolute top-5 left-5 z-10">
          <Image
            src="/navIcon.png"
            alt="Hallos"
            width={30}
            height={23}
            className="object-contain"
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          aria-label="Close promotion"
        >
          <X size={20} color="rgba(234,234,234,0.7)" />
        </button>

        {/* Content — centered column */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-6 pb-10 gap-4">
          {/* Title */}
          <h2
            className="text-white"
            style={{
              fontFamily: "Tangerine, cursive",
              fontSize: "clamp(28px, 5vw, 36px)",
              fontWeight: 700,
            }}
          >
            {PROMO.headline}
          </h2>

          {/* Main heading */}
          <p
            className="max-w-[600px]"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#f2f2f2",
            }}
          >
            {PROMO.bodyParts.length === 3 ? (
              <>
                {PROMO.bodyParts[0]}
                <span style={{ color: "#e9ce19", fontWeight: 700 }}>
                  {PROMO.bodyParts[1]}
                </span>
                {PROMO.bodyParts[2]}
              </>
            ) : (
              PROMO.bodyParts.join('')
            )}
          </p>

          {/* Spacer to let decorative images breathe */}
          <div className="h-32 sm:h-48" aria-hidden="true" />

          {/* LIMITED OFFER */}
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#e9ce19",
              letterSpacing: "0.05em",
            }}
          >
            {PROMO.limitedOffer}
          </span>

          {/* CTA */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-10 py-4 rounded-full transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "#6a57e5",
              boxShadow: "-4px 10px 24px rgba(42,29,122,0.30)",
            }}
            aria-label={PROMO.cta}
          >
            <Share2 size={16} color="#f2f2f2" />
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {PROMO.cta}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
