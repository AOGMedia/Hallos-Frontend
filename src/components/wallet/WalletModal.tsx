"use client";

import { memo, useEffect } from "react";
import CloseXModalIcon from "@/components/icons/CloseXModalIcon";
import { formatCurrency } from "./utils";
import type { WalletModalProps } from "./types";
import { AnimatedHeader } from "../ui/AnimatedHeader";

export const WalletModal = memo(function WalletModal({
  isOpen,
  onClose,
  type,
  pendingTransactions = [],
  historyTransactions = [],
}: WalletModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isPending = type === "pending";
  const title = isPending
    ? `Pending Balance (${pendingTransactions.length})`
    : "History";

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-wallet-pending-bg rounded-[40px] p-6 sm:p-10 w-full max-w-[1144px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <AnimatedHeader>
            <span className="text-xl font-bold text-text-primary">{title}</span>
          </AnimatedHeader>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Close modal"
          >
            <CloseXModalIcon
              width={24}
              height={24}
              className="text-text-primary"
            />
          </button>
        </div>

        {/* Table Container - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          {isPending ? (
            <PendingBalanceTable transactions={pendingTransactions} />
          ) : (
            <HistoryTable transactions={historyTransactions} />
          )}
        </div>
      </div>
    </div>
  );
});

// Pending Balance Table Component
const PendingBalanceTable = memo(function PendingBalanceTable({
  transactions,
}: {
  transactions: WalletModalProps["pendingTransactions"];
}) {
  return (
    <div className="min-w-[640px] px-6 sm:px-0">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 mb-[10px] rounded-[10px] bg-[linear-gradient(0deg,rgba(0,0,0,0.08),rgba(0,0,0,0.08)),rgba(234,234,234,0.06)] backdrop-blur-[60px]">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-normal text-text-gray">Class</span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray">Date</span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray leading-[20.30px]">
            Total
            <br />
            Revenue
          </span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray leading-[20.30px]">
            7.5% service
            <br />
            charge
          </span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray leading-[20.30px]">
            Total
            <br />
            Earned
          </span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col gap-[10px]">
        {transactions?.map((transaction, index) => (
          <div
            key={`${transaction.id}-${index}`}
            className="flex items-center gap-4 px-4 py-2 rounded-md bg-[rgba(234,234,234,0.06)] backdrop-blur-[60px]"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#eaeaea] truncate block">
                {transaction.className}
              </span>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-medium text-text-primary">
                {transaction.date}
              </span>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-semibold text-text-primary">
                {formatCurrency(transaction.totalRevenue)}
              </span>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-semibold text-text-primary">
                {formatCurrency(transaction.serviceCharge)}
              </span>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-semibold text-[#1dbf53]">
                +{formatCurrency(transaction.totalEarned)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// History Table Component
const HistoryTable = memo(function HistoryTable({
  transactions,
}: {
  transactions: WalletModalProps["historyTransactions"];
}) {
  return (
    <div className="min-w-[640px] px-6 sm:px-0">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-4 py-3 mb-[10px] rounded-[10px] bg-[linear-gradient(0deg,rgba(0,0,0,0.08),rgba(0,0,0,0.08)),rgba(234,234,234,0.06)] backdrop-blur-[60px]">
        <div className="w-[250px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray">
            Description
          </span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray">Date</span>
        </div>
        <div className="w-[120px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray">Amount</span>
        </div>
        <div className="w-[200px] flex-shrink-0">
          <span className="text-sm font-normal text-text-gray">
            Transaction ID
          </span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col gap-[10px]">
        {transactions?.map((transaction, index) => (
          <div
            key={`${transaction.id}-${index}`}
            className="flex items-center gap-4 px-4 py-2 rounded-md bg-[rgba(234,234,234,0.06)] backdrop-blur-[60px]"
          >
            <div className="w-[250px] flex-shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[#eaeaea] truncate block">
                  {transaction.description}
                </span>
                <span className="text-xs font-semibold text-[#3fb1d6]">
                  {transaction.category}
                </span>
              </div>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-medium text-text-primary">
                {transaction.date}
              </span>
            </div>
            <div className="w-[120px] flex-shrink-0">
              <span className="text-sm font-semibold text-[#1dbf53]">
                +{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="w-[200px] flex-shrink-0">
              <span className="text-sm font-medium text-text-primary truncate block">
                {transaction.transactionId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
