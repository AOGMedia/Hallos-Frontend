'use client';

import { useState, useEffect } from 'react';
import { couponService } from '@/services/couponService';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { CouponValidationData } from '@/types/coupon';

interface CouponInputProps {
  contentType: string;
  contentId: string;
  selectedCurrency: string;
  onApply: (data: CouponValidationData, couponCode: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  initialValue?: string;
}

export function CouponInput({
  contentType,
  contentId,
  onApply,
  onRemove,
  disabled,
  initialValue = '',
}: CouponInputProps) {
  const [localCoupon, setLocalCoupon] = useState(initialValue);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    if (initialValue && !isApplied) {
      setLocalCoupon(initialValue);
    }
  }, [initialValue, isApplied]);

  const handleApplyCoupon = async () => {
    if (!localCoupon) return;
    if (!user) {
      setError('Please log in to apply coupon.');
      return;
    }

    setIsApplyingCoupon(true);
    setError(null);

    const res = await couponService.validateCoupon({
      code: localCoupon,
      contentType,
      contentId,
    });

    if (res.success && res.data) {
      setIsApplied(true);
      onApply(res.data, localCoupon);
    } else {
      setError(res.message || 'Invalid coupon code. Please try again.');
    }

    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setIsApplied(false);
    setLocalCoupon('');
    setError(null);
    onRemove();
  };

  return (
    <div className="space-y-3 pt-4 border-t border-white/10 w-full">
      <label className="text-sm font-semibold text-text-primary">
        Have a coupon code?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={localCoupon}
          onChange={(e) => setLocalCoupon(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          disabled={disabled || isApplied}
          className={`flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary text-sm placeholder-text-muted/60 focus:outline-none focus:border-primary focus:bg-white/10 transition-all ${
            disabled || isApplied ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <button
          onClick={isApplied ? handleRemoveCoupon : handleApplyCoupon}
          disabled={disabled || isApplyingCoupon || (!localCoupon && !isApplied)}
          className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
            isApplied
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
          }`}
        >
          {isApplyingCoupon ? '...' : isApplied ? 'Remove' : 'Apply'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
