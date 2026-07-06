"use client";

import { useCallback, useEffect, useState } from "react";
import { WalletHeader } from "./WalletHeader";
import { WalletTabs } from "./WalletTabs";
import { WalletCard } from "./WalletCard";
import { WalletModal } from "./WalletModal";
import { WithdrawalModal } from "./WithdrawalModal";
import { AddBankAccountModal } from "./AddBankAccountModal";
import { EarningsStatistics } from "./EarningsStatistics";
import { TransferModal } from "./TransferModal";
import { TopUpModal } from "./TopUpModal";
import {
  useWalletStore,
  useWalletBalanceStore,
  useWalletTransactionStore,
} from "@/store";
import type { BankAccount } from "./types";

export function WalletContent() {
  // Local state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Zustand stores
  const {
    activeTab,
    modalState,
    isWithdrawalModalOpen,
    isAddBankModalOpen,
    setActiveTab,
    openModal,
    closeModal,
    openWithdrawalModal,
    closeWithdrawalModal,
    closeAddBankModal,
    navigateToAddBank,
    navigateBackToWithdrawal,
    addBankAccount,
  } = useWalletStore();

  const {
    balances,
    activeCurrency,
    setActiveCurrency,
    deductFromAvailableBalance,
    fetchBalance,
  } = useWalletBalanceStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Derived state for current view
  const currentBalance = balances[activeCurrency] || {
    availableBalance: 0,
    pendingBalance: 0,
    totalBalance: 0,
    currency: activeCurrency,
  };

  const {
    pendingTransactions,
    historyTransactions,
    addHistoryTransaction,
    fetchHistoryWithdrawals,
  } = useWalletTransactionStore();

  useEffect(() => {
    fetchHistoryWithdrawals();
  }, [fetchHistoryWithdrawals]);

  // Event handlers
  // const handleViewDetails = useCallback(() => {
  //   openModal("pending");
  // }, [openModal]);

  const handleViewHistory = useCallback(() => {
    fetchHistoryWithdrawals();
    openModal("history");
  }, [openModal, fetchHistoryWithdrawals]);

  const handleConfirmWithdrawal = useCallback(
    (amount: number) => {
      deductFromAvailableBalance(activeCurrency, amount);

      addHistoryTransaction({
        description: "Wallet withdrawal",
        category: "Withdrawal",
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        amount: amount,
        transactionId: `${Date.now()}/WD/${Math.random().toString(36).substring(7)}`,
      });

      closeWithdrawalModal();
    },
    [
      deductFromAvailableBalance,
      addHistoryTransaction,
      closeWithdrawalModal,
      activeCurrency,
    ],
  );

  const handleTopUp = useCallback(() => {
    setIsTopUpModalOpen(true);
  }, []);

  const handleAddBankAccountComplete = useCallback(
    (account: Omit<BankAccount, "id">) => {
      addBankAccount(account);
      navigateBackToWithdrawal();
    },
    [addBankAccount, navigateBackToWithdrawal],
  );

  const stopTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6">
        <WalletHeader />

        {/* Currency Selector & Main Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg w-fit">
              {(["NGN", "USD"] as const).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setActiveCurrency(currency)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeCurrency === currency
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-gray hover:text-white hover:bg-white/10"
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
            {!stopTransferModal && (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                Transfer Funds
              </button>
            )}
          </div>

          <WalletTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <WalletCard
            balance={{
              amount: currentBalance.pendingBalance,
              status: "pending",
              description:
                activeCurrency === "NGN"
                  ? "Total Pending Balance"
                  : "Pending USD Balance",
              currency: activeCurrency,
            }}
            // onViewDetails={handleViewDetails}
          />

          <WalletCard
            balance={{
              amount: currentBalance.availableBalance,
              status: "available",
              description:
                activeCurrency === "NGN"
                  ? "Total Available Balance"
                  : "Available USD Balance",
              currency: activeCurrency,
            }}
            onWithdraw={openWithdrawalModal}
            onTopUp={handleTopUp}
            onViewHistory={handleViewHistory}
          />
        </div>

        {/* Earnings Statistics */}
        <EarningsStatistics />
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => fetchBalance()}
      />

      {modalState.type && (
        <WalletModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          pendingTransactions={pendingTransactions}
          historyTransactions={historyTransactions}
        />
      )}

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={closeWithdrawalModal}
        availableBalance={currentBalance.availableBalance}
        onAddAccount={navigateToAddBank}
        onConfirm={handleConfirmWithdrawal}
      />

      <AddBankAccountModal
        isOpen={isAddBankModalOpen}
        onClose={closeAddBankModal}
        onBack={navigateBackToWithdrawal}
        onAddAccount={handleAddBankAccountComplete}
        activeCurrency={activeCurrency}
      />

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        currency={activeCurrency as 'NGN' | 'USD'}
      />
    </>
  );
}
