"use client";

import { memo, useEffect, useCallback, useState } from "react";
import CloseXIcon2 from "@/components/icons/CloseXIcon2";
import ChevronDownDropdownIcon from "@/components/icons/ChevronDownDropdownIcon";
import WalletBalanceIcon from "@/components/icons/WalletBalanceIcon";
import WalletArrowLeftIcon from "@/components/icons/WalletArrowLeftIcon";
import WalletArrowRightIcon from "@/components/icons/WalletArrowRightIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { formatCurrency, formatCurrencyWithSymbol } from "./utils";
import { useWalletStore, useWithdrawalStore } from "@/store";
import type { WithdrawalModalProps } from "./types";
import { AnimatedHeader } from "../ui/AnimatedHeader";
import { Check } from "lucide-react";

export const WithdrawalModal = memo(function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  onAddAccount,
  // onConfirm,
}: WithdrawalModalProps) {
  // Zustand stores
  const bankAccounts = useWalletStore((state) => state.bankAccounts);
  const isWithdrawing = useWalletStore((state) => state.isWithdrawing);
  const withdrawalError = useWalletStore((state) => state.withdrawalError);
  const initiateWithdrawal = useWalletStore((state) => state.initiateWithdrawal);

  const {
    amount,
    selectedAccountId,
    isDropdownOpen,
    fee,
    netAmount,
    isCalculatingFees,
    setAmount,
    setSelectedAccountId,
    setIsDropdownOpen,
    resetForm,
    canWithdraw,
    calculateFees,
  } = useWithdrawalStore();

  // 2FA State
  const withdrawal2FA = useWalletStore((state) => state.withdrawal2FA);
  const verifyWithdrawalOtp = useWalletStore((state) => state.verifyWithdrawalOtp);
  const resendWithdrawalOtp = useWalletStore((state) => state.resendWithdrawalOtp);
  const cancelWithdrawal = useWalletStore((state) => state.cancelWithdrawal);
  const withdrawalSuccess = useWalletStore((state) => state.withdrawalSuccess);
  const closeModal = useWalletStore((state) => state.closeWithdrawalModal);

  const [otpCode, setOtpCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Debounced fee calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        calculateFees();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, calculateFees]);

  const handleConfirm = useCallback(async () => {
    if (canWithdraw(availableBalance)) {
      const withdrawalAmount = parseFloat(amount);
      const success = await initiateWithdrawal(withdrawalAmount, selectedAccountId);
      if (success) {
        resetForm();
      }
    }
  }, [
    amount,
    selectedAccountId,
    availableBalance,
    canWithdraw,
    initiateWithdrawal,
    resetForm,
  ]);

  const selectedAccount = bankAccounts.find(
    (acc) => acc.id === selectedAccountId
  );
  const isFormValid = canWithdraw(availableBalance) && !isWithdrawing;

  if (!isOpen) return null;

  // Success View
  if (withdrawalSuccess.isSuccess) {
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div
          className="flex flex-col items-center gap-8 bg-wallet-pending-bg rounded-[40px] p-10 w-full max-w-[500px] text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-20 h-20 rounded-full bg-[#1dbf53]/20 flex items-center justify-center text-[#1dbf53]">
            <Check size={40} strokeWidth={3} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-text-primary">Withdrawal Initiated</h3>
            <p className="text-text-gray">
              Your withdrawal of <strong>{formatCurrencyWithSymbol(withdrawalSuccess.amount || 0, withdrawalSuccess.currency)}</strong> to {withdrawalSuccess.bankName} is being processed.
            </p>
          </div>

          <div className="w-full p-4 rounded-2xl bg-[rgba(234,234,234,0.06)] border border-[rgba(234,234,234,0.1)] flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-gray">Account Name</span>
              <span className="text-text-primary font-medium">{withdrawalSuccess.accountName}</span>
            </div>
            {withdrawalSuccess.estimatedCompletion && (
                <div className="flex justify-between">
                    <span className="text-text-gray">Estimated Arrival</span>
                    <span className="text-text-primary font-medium">
                        {new Date(withdrawalSuccess.estimatedCompletion).toLocaleDateString()}
                    </span>
                </div>
            )}
          </div>

          <button
            onClick={closeModal}
            className="w-full py-[18px] rounded-full bg-primary hover:opacity-90 transition-all font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // 2FA View
  if (withdrawal2FA.isRequired) {
      return (
        <div className="modal-overlay" onClick={() => {}}>
          <div
            className="flex flex-col gap-6 bg-wallet-pending-bg rounded-[40px] p-6 sm:p-10 w-full max-w-[500px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => cancelWithdrawal()}
                className="hover:opacity-70 transition-opacity"
                aria-label="Cancel withdrawal"
              >
                <div className="text-text-gray hover:text-text-primary text-sm flex items-center gap-1">
                  <WalletArrowLeftIcon width={14} height={10} className="rotate-0" />
                  Back
                </div>
              </button>
              <AnimatedHeader>
                <span className="text-xl font-bold text-text-primary">
                  Verification
                </span>
              </AnimatedHeader>
              <button
                onClick={() => cancelWithdrawal()}
                className="hover:opacity-70 transition-opacity flex-shrink-0"
                aria-label="Close modal"
              >
                <CloseXIcon2 width={24} height={24} className="text-text-primary" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-center">
                <p className="text-text-gray">
                    {withdrawal2FA.message ? withdrawal2FA.message : (
                        <>
                            Please move to your email {withdrawal2FA.otpSentTo && <strong>{withdrawal2FA.otpSentTo}</strong>} and type in the code to confirm the withdrawal.
                        </>
                    )}
                </p>

                {withdrawalError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {withdrawalError}
                    </div>
                )}

                <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="auth-input h-[57px] text-center text-lg tracking-widest"
                />

                <button
                    onClick={() => verifyWithdrawalOtp(otpCode)}
                    disabled={isWithdrawing || !otpCode}
                    className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full bg-[rgba(106,87,229,0.50)] hover:bg-[rgba(106,87,229,0.70)] disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full"
                >
                    {isWithdrawing ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                    <span className="wallet-button-text text-[rgba(229,229,229,0.95)]">
                        Confirm Withdraw
                    </span>
                    )}
                </button>

                <div className="flex items-center justify-center gap-4 text-sm mt-4">
                    <button 
                        onClick={async () => {
                            if (resendCooldown > 0) return;
                            setIsResending(true);
                            await resendWithdrawalOtp();
                            setIsResending(false);
                            setResendCooldown(60); // Default to 60s cooldown
                        }}
                        disabled={isResending || resendCooldown > 0}
                        className="text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        {isResending ? 'Resending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                    <span className="text-text-gray">|</span>
                    <button 
                        onClick={() => cancelWithdrawal()}
                        className="text-text-gray hover:text-text-primary transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="flex flex-col lg:flex-row gap-10 bg-wallet-pending-bg rounded-[40px] p-6 sm:p-10 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Form Section */}
        <div className="flex-1 flex flex-col gap-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <AnimatedHeader>
              <span className="text-xl font-bold text-text-primary">
                Available Balance: {formatCurrency(availableBalance)}
              </span>
            </AnimatedHeader>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Close modal"
            >
              <CloseXIcon2
                width={24}
                height={24}
                className="text-text-primary"
              />
            </button>
          </div>

          {/* Error Message */}
          {withdrawalError && (
             <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
               {withdrawalError}
             </div>
          )}

          {/* Amount Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isWithdrawing}
              className="auth-input h-[57px] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* Fee Breakdown moved to Summary section */}
          </div>

          {/* Bank Selection */}
          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">
                To Bank
              </label>
              <div className="relative">
                <button
                  onClick={() => !isWithdrawing && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isWithdrawing}
                  className="w-full flex items-center justify-between gap-2 px-[18px] py-4 rounded-md border border-[rgba(234,234,234,0.20)] bg-[rgba(234,234,234,0.06)] backdrop-blur-[60px] text-left h-[57px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-semibold text-[rgba(234,234,234,0.50)]">
                    {selectedAccount
                      ? `${selectedAccount.bankName} - ${selectedAccount.accountNumber}`
                      : "Select Bank account"}
                  </span>
                  <ChevronDownDropdownIcon
                    width={17}
                    height={9}
                    className="text-[#eaeaea] flex-shrink-0"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-wallet-pending-bg border border-[rgba(234,234,234,0.20)] rounded-md shadow-lg max-h-[200px] overflow-y-auto z-10">
                    {bankAccounts.length > 0 ? (
                      bankAccounts.map((account, index) => (
                        <button
                          key={`${account.id}-${index}`}
                          onClick={() => {
                            setSelectedAccountId(account.id);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-[rgba(234,234,234,0.1)] transition-colors"
                        >
                          {account.bankName} - {account.accountNumber}
                          <div className="text-xs text-text-gray mt-1">
                            {account.accountName}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-text-gray text-center">
                        No bank accounts added yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Add Account Link */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-normal text-text-primary">
                Don&apos;t have an account?
              </span>
              <button
                onClick={onAddAccount}
                disabled={isWithdrawing}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-semibold text-[rgba(234,234,234,0.50)] underline">
                  Add account
                </span>
                <PlusIcon
                  width={14}
                  height={14}
                  className="text-[rgba(234,234,234,0.50)]"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex flex-col items-center gap-4 lg:pt-16 w-full lg:w-auto">
          <div className="flex flex-col items-center gap-[6px]">
            <WalletBalanceIcon
              width={21}
              height={20}
              className="text-text-primary"
            />
            <span className="text-xs font-normal text-text-gray leading-3">
              Summary
            </span>
          </div>

          {/* Fee Breakdown Display */}
          {(isCalculatingFees || (fee !== null && netAmount !== null)) && (
            <div className="w-full min-w-[200px] p-4 rounded-2xl bg-[rgba(234,234,234,0.06)] border border-[rgba(234,234,234,0.1)] flex flex-col gap-3">
              {isCalculatingFees ? (
                <div className="flex items-center justify-center gap-2 text-sm text-text-gray py-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-gray">Amount</span>
                    <span className="text-text-primary font-medium">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-gray">Fee</span>
                    <span className="text-accent-red font-medium">-{formatCurrency(fee!)}</span>
                  </div>
                  <div className="h-[1px] bg-[rgba(234,234,234,0.1)] w-full my-1" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-gray font-medium">You Receive</span>
                    <span className="text-[#1dbf53] font-bold text-base">{formatCurrency(netAmount!)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full bg-[rgba(106,87,229,0.50)] hover:bg-[rgba(106,87,229,0.70)] disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full"
          >
            {isWithdrawing ? (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="wallet-button-text text-[rgba(229,229,229,0.95)]">
                  Confirm
                </span>
                <WalletArrowRightIcon
                  width={18}
                  height={14}
                  className="text-[rgba(229,229,229,0.95)]"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
