import { memo } from "react";
import WalletArrowLeftIcon from "@/components/icons/WalletArrowLeftIcon";
import { AnimatedHeader } from "../ui/AnimatedHeader";

export const WalletHeader = memo(function WalletHeader() {
  return (
    <div className="flex items-center gap-[10px]">
      <WalletArrowLeftIcon
        width={18}
        height={14}
        className="text-text-primary"
      />

      <AnimatedHeader>
        <span className="wallet-title">Wallet</span>
      </AnimatedHeader>
    </div>
  );
});
