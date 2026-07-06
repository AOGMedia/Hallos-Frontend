import React from "react";
import LiveDotIcon from "@/components/icons/LiveDotIcon";
import { ArrowRightIcon } from "lucide-react";
type LiveEventBtnProps = {
  scheduleClass: boolean;
  handleGoLive: () => void;
  handleSendInvite?: () => void;
  loading?: boolean;
};
const LiveEventActionBtn = ({
  scheduleClass,
  handleGoLive,
  handleSendInvite,
  loading = false,
}: LiveEventBtnProps) => {
  return (
    <div className="flex items-center-end justify-end">
      {scheduleClass ? (
        <button
          type="button"
          onClick={handleSendInvite}
          disabled={loading}
          className="self-end flex items-center gap-2 px-6 py-4 rounded-full transition-all mt-auto bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex live-event-button-text">
            {loading ? 'Creating...' : 'Schedule'}
            {!loading && <ArrowRightIcon />}
          </span>
        </button>
      ) : (
        <button
          onClick={handleGoLive}
          disabled={loading}
          className="
self-end items-center gap-2 px-6 py-4 rounded-full transition-all mt-auto border border-[rgba(234,234,234,0.20)] bg-transparent text-[rgba(229,229,229,0.95)] hover:border-text-primary flex disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span className="live-event-button-text">
            {loading ? 'Creating...' : 'Go Live Now'}
          </span>
        </button>
      )}
    </div>
  );
};

export default LiveEventActionBtn;
