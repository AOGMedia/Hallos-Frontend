import React from 'react'
import LiveDotIcon from "@/components/icons/LiveDotIcon";
type LiveButtonProps={
    onClick?:()=>void;
    children:React.ReactNode;

}

const LiveButton = ({onClick, children}:LiveButtonProps) => {
  return (
    <button
          onClick={onClick}
          className="
self-end items-center gap-2 px-6 py-4 rounded-full transition-all mt-auto border border-[rgba(234,234,234,0.20)] bg-transparent text-[rgba(229,229,229,0.95)] hover:border-text-primary flex"
          style={{
            boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.30)",
          }}
        >
          <LiveDotIcon
            width={26}
            height={26}
            // color="#F5313B"
            className="sm:w-5 sm:h-5 animate-pulse"
          />
          <span className="live-event-button-text">{children}</span>
        </button>
  )
}

export default LiveButton