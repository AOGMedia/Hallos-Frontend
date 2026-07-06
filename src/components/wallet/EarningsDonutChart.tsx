'use client';

import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { EarningsDropdown, type DropdownOption } from './EarningsDropdown';
import { formatCurrency } from './utils';
import type { Currency } from './types';

interface EarningsDonutChartProps {
  currency: Currency;
  month: string;
  onCurrencyChange: (c: Currency) => void;
  onMonthChange: (m: string) => void;
  totalEarned: number;
  expenses: number;
  videoEarnings: number;
  liveClassEarnings: number;
}

export const EarningsDonutChart = memo(function EarningsDonutChart({
  currency, month, onCurrencyChange, onMonthChange,
  totalEarned, expenses, videoEarnings, liveClassEarnings,
}: EarningsDonutChartProps) {
  const currencyOptions: DropdownOption<Currency>[] = useMemo(() => [
    { value: 'NGN', label: 'NGN' },
    { value: 'USD', label: 'USD' },
  ], []);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const thisM = now.toLocaleString('default', { month: 'long' });
    const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastM = lastDate.toLocaleString('default', { month: 'long' });
    const lastY = lastDate.getFullYear();
    return [
      { value: `${thisM} ${now.getFullYear()}`, label: `${thisM} ${now.getFullYear()}` },
      { value: `${lastM} ${lastY}`, label: `${lastM} ${lastY}` },
    ];
  }, []);

  const donutData = useMemo(() => [
    { name: 'Total Earned', value: totalEarned, color: 'url(#donutGradient)' },
    { name: 'Expenses', value: expenses, color: '#5a62a2' },
  ], [totalEarned, expenses]);

  const total = totalEarned + expenses;
  const currencySymbol = currency === 'USD' ? '$' : '₦';

  const CustomDonutTooltip = useCallback(({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-wallet-pending-bg border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-text-primary">{payload[0].name}</p>
          <p className="text-xs text-text-muted">{currencySymbol}{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-text-muted">{pct}%</p>
        </div>
      );
    }
    return null;
  }, [total, currencySymbol]);

  const renderCustomLabel = useCallback(() => {
    const display = totalEarned >= 1_000_000
      ? `${(totalEarned / 1_000_000).toFixed(1)}m`
      : totalEarned >= 1_000
      ? `${(totalEarned / 1_000).toFixed(0)}k`
      : totalEarned > 0 ? String(totalEarned) : '0';
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
        <tspan x="50%" dy="-8" fontSize="22" fontWeight="700" fill="#f2f2f2" fontFamily="Plus Jakarta Sans" letterSpacing="-0.5px">
          {display}
        </tspan>
        <tspan x="50%" dy="20" fontSize="10" fontWeight="400" fill="rgba(242, 242, 242, 0.65)" fontFamily="Plus Jakarta Sans">
          Total Earnings
        </tspan>
      </text>
    );
  }, [totalEarned]);

  const emptyData = [{ name: 'Empty', value: 1, color: 'rgba(255,255,255,0.06)' }];
  const activeData = total > 0 ? donutData : emptyData;

  return (
    <div className="flex flex-col gap-6">
      {/* Dropdowns */}
      <div className="flex items-center justify-end gap-2.5 flex-wrap">
        <EarningsDropdown value={currency} options={currencyOptions} onChange={onCurrencyChange} />
        <EarningsDropdown value={month} options={monthOptions} onChange={onMonthChange} />
      </div>

      {/* Donut Chart */}
      <div className="relative flex items-center justify-center h-[200px] w-full">
        <div className="w-[200px] h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <radialGradient id="donutGradient" cx="50%" cy="35.64%" r="64.36%">
                  <stop offset="0%" stopColor="#DC57E5" />
                  <stop offset="100%" stopColor="#6A57E5" />
                </radialGradient>
                <linearGradient id="innerGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="4.59%" stopColor="rgba(106, 87, 229, 0)" />
                  <stop offset="95.53%" stopColor="#1F2636" />
                </linearGradient>
                <linearGradient id="innerGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="5.32%" stopColor="rgba(106, 87, 229, 0.2)" />
                  <stop offset="95.16%" stopColor="rgba(229, 87, 198, 0.2)" />
                </linearGradient>
              </defs>
              <Pie
                data={activeData}
                cx="50%" cy="50%"
                innerRadius={58} outerRadius={88}
                paddingAngle={0} dataKey="value"
                label={renderCustomLabel}
                startAngle={90} endAngle={-270}
              >
                {activeData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <circle cx="50%" cy="50%" r={56} fill="url(#innerGradient2)" />
              <circle cx="50%" cy="50%" r={56} fill="url(#innerGradient1)" />
              {total > 0 && <Tooltip content={<CustomDonutTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary rows */}
      <div className="flex flex-col gap-2">
        {[
          { label: 'Total Earned', value: totalEarned, color: 'bg-primary' },
          { label: 'Expenses', value: expenses, color: 'bg-[#5a62a2]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-[2px] ${color} flex-shrink-0`} />
              <span className="text-sm font-medium text-[rgba(242,242,242,0.8)] tracking-[0.04px]">{label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-medium text-text-primary tracking-[1.2px]">
                {currencySymbol}{formatCurrency(value)}
              </span>
              <Image
                src="/icons/chevron-down-small.svg"
                alt=""
                width={12}
                height={6}
                className="flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(61%) sepia(6%) saturate(340%) hue-rotate(177deg) brightness(91%) contrast(84%)' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* By Content Type */}
      {(videoEarnings > 0 || liveClassEarnings > 0) && (
        <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">By Content Type</p>
          {[
            { label: 'Videos', value: videoEarnings, icon: '🎬' },
            { label: 'Live Classes', value: liveClassEarnings, icon: '📡' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between gap-2.5">
              <span className="text-sm text-[rgba(242,242,242,0.7)]">{icon} {label}</span>
              <span className="text-sm font-semibold text-text-primary">
                {currencySymbol}{formatCurrency(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
