import { memo } from 'react';
import Image from 'next/image';
import SendIcon from '@/components/icons/SendIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, getCurrencySymbol } from './utils';
import type { WalletCardProps } from './types';

export const WalletCard = memo(function WalletCard({
  balance,
  // onViewDetails,
  onWithdraw,
  onTopUp,
  onViewHistory,
}: WalletCardProps) {
  const isPending = balance.status === 'pending';
  
  return (
    <div
      className={`flex flex-col gap-10 p-10 rounded-[40px] relative overflow-hidden ${
        isPending
          ? 'bg-wallet-pending-bg'
          : 'bg-[#1f2636] bg-[linear-gradient(250.32deg,rgba(106,87,229,0.2)_5.32%,rgba(229,87,198,0.2)_95.16%),linear-gradient(249.02deg,rgba(106,87,229,0)_4.59%,rgba(31,38,54,1)_95.53%)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <StatusBadge status={balance.status} />
        {!isPending && onViewHistory && (
          <button onClick={onViewHistory} className="wallet-link-text hover:opacity-80 transition-opacity">
            View history
          </button>
        )}
      </div>

      {/* Balance */}
      <div className="flex flex-col gap-1">
        <div className="wallet-amount">
          {getCurrencySymbol(balance.currency || 'NGN')}{formatCurrency(balance.amount || 0)}
        </div>
        <div className="wallet-description">{balance.description}</div>
      </div>

      {/* Actions */}
      {isPending ? (
        <button
          // onClick={onViewDetails}
          className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full border-[1.2px] border-[rgba(106,87,229,1)] bg-[rgba(106,87,229,0.01)] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.30)] hover:bg-[rgba(106,87,229,0.05)] transition-all w-fit"
        >
          {/* <span className="wallet-button-text text-[rgba(229,229,229,0.95)]">View details</span> */}
          {/* <WalletArrowRightIcon width={18} height={14} className="text-[rgba(229,229,229,0.95)]" /> */}
        </button>
      ) : (
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={onWithdraw}
            className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full border-[1.2px] border-[rgba(106,87,229,1)] bg-[rgba(106,87,229,0.01)] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.30)] hover:bg-[rgba(106,87,229,0.05)] transition-all"
          >
            <span className="wallet-button-text text-[rgba(229,229,229,0.95)]">Withdraw</span>
            <SendIcon width={19} height={20} className="text-[rgba(229,229,229,0.95)]" />
          </button>
          
          {/* Top Up */}
          <button
            onClick={onTopUp}
            className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full bg-primary hover:opacity-90 transition-opacity"
          >
            <span className="wallet-button-text text-white">Top Up</span>
            <PlusIcon width={14} height={14} className="text-white" />
          </button>
        </div>
      )}

      {/* Decorative SVG for Available card */}
      {!isPending && (
        <Image
          src="/wallet-decoration.svg"
          alt=""
          width={127}
          height={127}
          className="absolute bottom-0 left-0 pointer-events-none"
        />
      )}
    </div>
  );
});