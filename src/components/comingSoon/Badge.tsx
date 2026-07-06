import { ReactNode } from "react";

interface ComingSoonBadgeProps {
  children?: ReactNode;
  className?: string;
}

export default function Badge({ 
  children, 
  className = "" 
}: ComingSoonBadgeProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}

      {/* Coming Soon Badge */}
      <span
        className="
          absolute -top-2 right-8 
          px-2 py-1 
          text-[8px] font-bold text-white 
          bg-gradient-to-r from-purple-600 to-pink-600 
          rounded-full 
          shadow-lg 
          animate-pulse 
          ring-2 ring-white 
          z-10
          whitespace-nowrap
        "
      >
        Coming Soon
      </span>
    </div>
  );
}