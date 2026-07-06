"use client";

import { memo, useEffect, useCallback, useMemo } from "react";
import { Check } from "lucide-react";
import CloseXIcon2 from "@/components/icons/CloseXIcon2";
import WalletArrowLeftIcon from "@/components/icons/WalletArrowLeftIcon";
import ChevronDownDropdownIcon from "@/components/icons/ChevronDownDropdownIcon";
import { useAddBankAccountStore } from "@/store";
import type { AddBankAccountModalProps } from "./types";
import { AnimatedHeader } from "../ui/AnimatedHeader";

export const AddBankAccountModal = memo(function AddBankAccountModal({
  isOpen,
  onClose,
  onBack,
  onAddAccount,
  activeCurrency,
}: AddBankAccountModalProps & { activeCurrency: string }) {
  // Zustand store
  const {
    banks,
    // isLoadingBanks,
    selectedBank,
    accountNumber,
    accountName,
    isVerifying,
    isBankDropdownOpen,
    bankSearchQuery,
    fetchBanks,
    setSelectedBank,
    setAccountNumber,
    setIsBankDropdownOpen,
    setBankSearchQuery,
    verifyAccount,
    resetForm,
    canAddAccount,
  } = useAddBankAccountStore();

  useEffect(() => {
    fetchBanks(activeCurrency);
  }, [fetchBanks, activeCurrency]);

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Verify account number when it changes
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      verifyAccount();
    }
  }, [selectedBank, accountNumber, verifyAccount]);

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    if (!bankSearchQuery) return banks;
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
    );
  }, [bankSearchQuery, banks]);

  const handleAddAccount = useCallback(() => {
    if (canAddAccount() && selectedBank && accountNumber && accountName) {
      onAddAccount({
        bankName: selectedBank.name,
        accountNumber,
        accountName,
        bankCode: selectedBank.code,
      });
      // Reset form after successful addition
      resetForm();
    }
  }, [
    canAddAccount,
    selectedBank,
    accountNumber,
    accountName,
    onAddAccount,
    resetForm,
  ]);

  const isFormValid = canAddAccount();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-wallet-pending-bg rounded-[40px] p-6 sm:p-10 w-full max-w-[640px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <WalletArrowLeftIcon
                width={18}
                height={14}
                className="text-text-primary"
              />
            </button>
            <AnimatedHeader>
              <span className="wallet-title">Add Bank</span>
            </AnimatedHeader>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Close modal"
          >
            <CloseXIcon2 width={24} height={24} className="text-text-primary" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-10">
          {/* Select Bank */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Select Bank
            </label>
            <div className="relative">
              <button
                onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-[18px] py-4 rounded-md border border-[rgba(234,234,234,0.20)] bg-[rgba(234,234,234,0.06)] backdrop-blur-[60px] text-left h-[57px]"
              >
                <span className="text-sm font-semibold text-[rgba(234,234,234,0.50)]">
                  {selectedBank ? selectedBank.name : "Select Bank"}
                </span>
                <ChevronDownDropdownIcon
                  width={17}
                  height={9}
                  className="text-[#eaeaea] flex-shrink-0"
                />
              </button>

              {/* Bank Dropdown with Search */}
              {isBankDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-wallet-pending-bg border border-[rgba(234,234,234,0.20)] rounded-md shadow-lg z-10 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-[rgba(234,234,234,0.20)]">
                    <input
                      type="text"
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      placeholder="Search bank..."
                      className="w-full px-3 py-2 bg-[rgba(234,234,234,0.06)] border border-[rgba(234,234,234,0.20)] rounded text-sm text-text-primary placeholder:text-[rgba(234,234,234,0.50)] outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>

                  {/* Bank List */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank, index) => (
                        <button
                          key={`${bank.id}-${index}`}
                          onClick={() => {
                            setSelectedBank(bank);
                            setIsBankDropdownOpen(false);
                            setBankSearchQuery("");
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-[rgba(234,234,234,0.1)] transition-colors"
                        >
                          {bank.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-text-gray text-center">
                        No banks found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter 10-digit account number"
              disabled={!selectedBank}
              className="auth-input h-[57px] disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={10}
            />

            {/* Account Name Display */}
            {isVerifying && (
              <div className="flex items-center gap-2 mt-2 text-sm text-text-gray">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Verifying account...</span>
              </div>
            )}

            {accountName && !isVerifying && (
              <div className="flex items-center gap-2 mt-2 text-sm text-[#1dbf53]">
                <Check size={16} />
                <span className="font-semibold">{accountName}</span>
              </div>
            )}

            {!accountName && !isVerifying && accountNumber.length === 10 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-accent-red">
                <span>Account not found</span>
              </div>
            )}
          </div>

          {/* Add Account Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddAccount}
              disabled={!isFormValid}
              className="flex items-center justify-center gap-2 px-10 py-[18px] rounded-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="wallet-button-text text-white">Add Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
