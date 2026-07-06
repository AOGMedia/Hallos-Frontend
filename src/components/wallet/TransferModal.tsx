"use client";

import { memo, useState } from "react";
import CloseXModalIcon from "@/components/icons/CloseXModalIcon";
import { AnimatedHeader } from "../ui/AnimatedHeader";
import { useWalletBalanceStore } from "@/store";
import { transferFunds } from "@/lib/api/wallet";
import { formatCurrency, getCurrencySymbol } from "./utils";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferModal = memo(function TransferModal({
  isOpen,
  onClose,
  onSuccess,
}: TransferModalProps) {
  const { activeCurrency, balances, deductFromAvailableBalance } = useWalletBalanceStore();
  const balance = balances[activeCurrency];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipientId: "",
    amount: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      if (amount > (balance?.availableBalance || 0)) {
        throw new Error("Insufficient funds");
      }

      // Assuming recipientId is numeric for now based on API. 
      // If it's email, the API needs to resolve it first or accept email.
      // Based on wallet.md, it expects `toUserId` (number).
      // We'll assume the input is the ID for MVP or we'd need a user search.
      
      const { success, message } = await transferFunds({
        toUserId: parseInt(formData.recipientId),
        currency: activeCurrency,
        amount,
        description: formData.description,
      });

      if (success) {
        deductFromAvailableBalance(activeCurrency, amount);
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({ recipientId: "", amount: "", description: "" });
      } else {
        setError(message || "Transfer failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-[#1f2636] rounded-[24px] p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-gray hover:text-white"
        >
          <CloseXModalIcon width={24} height={24} />
        </button>

        <AnimatedHeader>
          <span className="text-xl font-bold text-white mb-6">Transfer Funds</span>
        </AnimatedHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-gray">Recipient User ID</label>
            <input
              type="number"
              required
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. 12345"
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-gray">
              Amount ({activeCurrency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray">
                {getCurrencySymbol(activeCurrency)}
              </span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="text-xs text-text-gray text-right">
              Available: {getCurrencySymbol(activeCurrency)}
              {formatCurrency(balance?.availableBalance || 0)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-gray">Description</label>
            <textarea
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none h-24"
              placeholder="What is this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Send Funds"}
          </button>
        </form>
      </div>
    </div>
  );
});
