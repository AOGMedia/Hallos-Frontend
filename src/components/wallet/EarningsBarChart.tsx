'use client';

import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EarningsDropdown, type DropdownOption } from './EarningsDropdown';
import { formatCurrency } from './utils';
import type { TimePeriod } from './types';

interface EarningsBarChartProps {
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  thisMonthEarned: number;
  lastMonthEarned: number;
  thisMonthExpenses: number;
  lastMonthExpenses: number;
}

export const EarningsBarChart = memo(function EarningsBarChart({
  period, onPeriodChange,
  thisMonthEarned, lastMonthEarned,
  thisMonthExpenses, lastMonthExpenses,
}: EarningsBarChartProps) {
  const periodOptions: DropdownOption<TimePeriod>[] = useMemo(() => [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
  ], []);

  const chartData = useMemo(() => {
    if (period === 'last-month') {
      return [
        { month: 'Earned', inflow: lastMonthEarned, outflow: 0 },
        { month: 'Expenses', inflow: 0, outflow: lastMonthExpenses },
      ];
    }
    return [
      { month: 'This Month', inflow: thisMonthEarned, outflow: thisMonthExpenses },
      { month: 'Last Month', inflow: lastMonthEarned, outflow: lastMonthExpenses },
    ];
  }, [period, thisMonthEarned, lastMonthEarned, thisMonthExpenses, lastMonthExpenses]);

  const CustomTooltip = useCallback(({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { month: string }; value?: number }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-wallet-pending-bg border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-text-primary mb-2">{payload[0].payload.month}</p>
          <p className="text-xs text-primary">Inflow: ₦{formatCurrency(payload[1]?.value || 0)}</p>
          <p className="text-xs text-[#393f6b]">Outflow: ₦{formatCurrency(payload[0]?.value || 0)}</p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-base font-semibold text-text-primary tracking-[-0.24px]">Earnings Statistics</h3>
        <EarningsDropdown value={period} options={periodOptions} onChange={onPeriodChange} />
      </div>

      <div className="relative mt-5 h-[285px] rounded-lg overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }} barGap={4} barCategoryGap="10%">
            <CartesianGrid strokeDasharray="0" stroke="rgba(136, 140, 148, 0.12)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false}
              tick={{ fill: '#f2f2f2', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: 400 }} dy={8} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: '#f2f2f2', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: 400 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              domain={[0, 'auto']} width={50} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(106, 87, 229, 0.05)' }} />
            <Bar dataKey="outflow" fill="#393f6b" radius={[10, 10, 0, 0]} maxBarSize={80} />
            <Bar dataKey="inflow" fill="#6a57e5" radius={[10, 10, 0, 0]} maxBarSize={80} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="relative w-full flex justify-center">
        <Image src="/wallet-legend.svg" alt="Chart legend" width={686} height={35} className="w-auto h-auto max-w-full" />
      </div>
    </div>
  );
});
