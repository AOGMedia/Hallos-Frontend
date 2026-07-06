import { memo } from "react";
import StatusCircleIcon from "@/components/icons/StatusCircleIcon";
import type { WalletStatus } from "./types";
import { AnimatedHeader } from "../ui/AnimatedHeader";

interface StatusBadgeProps {
  status: WalletStatus;
}

export const StatusBadge = memo(function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusColor = status === "pending" ? "#ffd42a" : "#00ff88";
  const statusText = status === "pending" ? "Pending" : "Available";

  return (
    <div className="flex items-center gap-[10px]">
      <StatusCircleIcon width={26} height={26} style={{ color: statusColor }} />
      <AnimatedHeader>
        <span className="wallet-status-text">{statusText}</span>
      </AnimatedHeader>
    </div>
  );
});
