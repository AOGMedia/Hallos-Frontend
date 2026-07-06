'use client';

import { useState, useTransition } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { initializeTopUp } from '@/lib/api/wallet';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'NGN' | 'USD';
}

const MIN_AMOUNT: Record<string, number> = { NGN: 1400, USD: 1 };
const PRESETS: Record<string, number[]> = {
  NGN: [2000, 5000, 10000, 20000],
  USD: [2, 5, 10, 20],
};

export function TopUpModal({ isOpen, onClose, currency }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const min = MIN_AMOUNT[currency];
  const symbol = currency === 'NGN' ? '₦' : '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num < min) {
      setError(`Minimum top-up is ${symbol}${min.toLocaleString()}`);
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const res = await initializeTopUp({ currency, amount: num });
        if (res.success && res.authorizationUrl) {
          window.open(res.authorizationUrl, '_blank');
          onClose();
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'Failed to initialize top-up');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1f2636] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">Top Up Wallet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Currency badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">{currency}</span>
            <span className="text-text-muted text-xs">Min: {symbol}{min.toLocaleString()}</span>
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {PRESETS[currency].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                  amount === String(p)
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'
                }`}
              >
                {symbol}{p.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Or enter amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">{symbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                placeholder={`${min}`}
                min={min}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !amount}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
