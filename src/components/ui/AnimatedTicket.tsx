"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// --- SVG Icons ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// --- Helper Components ---
const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-white/20"
    aria-hidden="true"
  />
);

const Barcode = ({ value }: { value: string }) => {
  const hashCode = (s: string) =>
    s.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  const seed = hashCode(value);
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 70;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for value ${value}`}
        className="fill-current text-white"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return <rect key={index} x={x} y="10" width={bar.width} height="50" />;
        })}
      </svg>
      <p className="text-sm text-[#888C94] tracking-[0.3em] mt-2">{value}</p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const confettiCount = 100;
  const colors = ["#6A57E5", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#f97316"];

  return (
    <>
      <style>{`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// --- Main Ticket Component ---
export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  ticketId: string;
  amount: string;
  date: Date;
  name: string;
  email: string;
  barcodeValue: string;
  onDownloadReceipt?: () => void;
  isForDownload?: boolean;
}

const AnimatedTicket = React.forwardRef<HTMLDivElement, TicketProps>(
  (
    {
      className,
      ticketId,
      amount,
      date,
      name,
      email,
      barcodeValue,
      onDownloadReceipt,
      isForDownload = false,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      if (!isForDownload) {
        const mountTimer = setTimeout(() => setShowConfetti(true), 100);
        const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
        return () => {
          clearTimeout(mountTimer);
          clearTimeout(unmountTimer);
        };
      }
    }, [isForDownload]);

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    return (
      <>
        {showConfetti && !isForDownload && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-[#1f2636] text-white rounded-3xl shadow-2xl shadow-[#6A57E5]/20 z-10 overflow-hidden",
            !isForDownload && "animate-in fade-in-0 zoom-in-95 duration-500",
            className
          )}
          {...props}
        >
          {/* Ticket cut-out effect */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1f2636]" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1f2636]" />

          {/* Header */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="p-3 bg-[#6A57E5]/20 rounded-full animate-in zoom-in-50 delay-300 duration-500">
              <CheckCircleIcon className="w-10 h-10 text-[#6A57E5] animate-in zoom-in-75 delay-500 duration-500" />
            </div>
            <h1 className="text-2xl font-extrabold mt-4 uppercase tracking-tight">First Step In!</h1>
            <p className="text-[#888C94] mt-1 text-lg">
              Your spot has been secured <br />
              (check your mail🎉)
            </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Receipt Header */}
            <div className="text-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tight">HALLOS  Millionaires Retreat - Receipt</h2>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[...Array(40)].map((_, i) => (
                  <span key={i} className="text-[#6A57E5]">•</span>
                ))}
              </div>
            </div>

            <DashedLine />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-[#888C94] uppercase tracking-wider">Ticket ID</p>
                <p className="font-mono font-medium">{ticketId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#888C94] uppercase tracking-wider">Amount</p>
                <p className="font-semibold text-lg">{amount}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#888C94] uppercase tracking-wider">Reference</p>
              <p className="font-mono font-medium">{barcodeValue}</p>
            </div>

            <div>
              <p className="text-xs text-[#888C94] uppercase tracking-wider">Date & Time</p>
              <p className="font-medium">{formattedDate}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl space-y-2">
              <div>
                <p className="text-xs text-[#888C94] uppercase tracking-wider">Name</p>
                <p className="font-semibold">{name}</p>
              </div>
              <div>
                <p className="text-xs text-[#888C94] uppercase tracking-wider">Email</p>
                <p className="text-sm text-[#eaeaea]">{email}</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-[#888C94] uppercase tracking-wider">Status</p>
              <p className="font-bold text-[#6A57E5]">COMPLETED</p>
            </div>

            <DashedLine />

            <Barcode value={barcodeValue} />

            <div className="text-center pb-2">
              <p className="text-sm text-[#888C94]">Thank you for registering! Check your email for more details.</p>
            </div>

            {onDownloadReceipt && !isForDownload && (
              <Button
                variant="primary"
                size="lg"
                onClick={onDownloadReceipt}
                className="w-full h-14 bg-[#6A57E5] hover:bg-[#6A57E5]/90 rounded-full font-bold text-lg"
              >
                Download Receipt
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export { AnimatedTicket };
