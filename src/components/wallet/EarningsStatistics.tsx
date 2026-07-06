'use client';

import { memo, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactionStats, getEarningsBreakdown } from '@/lib/api/wallet';
import { EarningsBarChart } from './EarningsBarChart';
import { EarningsDonutChart } from './EarningsDonutChart';
import type { TimePeriod, Currency } from './types';

export const EarningsStatistics = memo(function EarningsStatistics() {
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthLabel = `${lastMonthDate.toLocaleString('default', { month: 'long' })} ${lastMonthDate.getFullYear()}`;

  const [period, setPeriod] = useState<TimePeriod>('this-month');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [month, setMonth] = useState(`${currentMonth} ${currentYear}`);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['transaction-stats'],
    queryFn: getTransactionStats,
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings-breakdown'],
    queryFn: getEarningsBreakdown,
  });

  const isLoading = statsLoading || earningsLoading;
  const stats = statsData?.stats;
  const earnings = earningsData?.earnings;

  const expenses = (stats?.payoutAmount || 0) + (stats?.feeAmount || 0);

  const totalEarned = useMemo(() => {
    if (earnings?.totalEarnings) return earnings.totalEarnings[currency] ?? 0;
    return currency === 'NGN' ? (stats?.purchaseAmount || 0) : 0;
  }, [earnings, stats, currency]);

  const thisMonthEarned = useMemo(() => earnings?.thisMonth?.[currency] ?? 0, [earnings, currency]);
  const lastMonthEarned = useMemo(() => earnings?.lastMonth?.[currency] ?? 0, [earnings, currency]);

  const thisMonthExpenses = useMemo(() => {
    const base = totalEarned > 0 ? expenses * (thisMonthEarned / totalEarned) : 0;
    return Math.round(base);
  }, [expenses, thisMonthEarned, totalEarned]);

  const lastMonthExpenses = useMemo(() => {
    const base = totalEarned > 0 ? expenses * (lastMonthEarned / totalEarned) : 0;
    return Math.round(base);
  }, [expenses, lastMonthEarned, totalEarned]);

  const donutEarned = month === lastMonthLabel ? lastMonthEarned : thisMonthEarned;
  const donutExpenses = useMemo(() => {
    const base = totalEarned > 0 ? expenses * (donutEarned / totalEarned) : 0;
    return Math.round(base);
  }, [expenses, donutEarned, totalEarned]);

  const videoEarnings = useMemo(() => earnings?.byContentType?.video?.[currency] ?? 0, [earnings, currency]);
  const liveClassEarnings = useMemo(() => earnings?.byContentType?.live_class?.[currency] ?? 0, [earnings, currency]);

  const overallEarned = stats?.purchaseAmount || 0;
  const hasData = overallEarned > 0 || expenses > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {[1, 2].map(i => (
          <div key={i} className={`${i === 1 ? 'flex-1' : 'w-full lg:w-auto lg:min-w-[400px]'} p-6 md:p-10 rounded-[40px] bg-wallet-pending-bg flex items-center justify-center min-h-[400px]`}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {i === 1 && <p className="text-sm text-text-muted">Loading statistics...</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="flex-1 p-6 md:p-10 rounded-[40px] bg-wallet-pending-bg flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">No transaction data yet</p>
            <p className="text-xs text-text-muted max-w-[300px]">Your earnings statistics will appear here once you start receiving payments</p>
          </div>
        </div>
        <div className="w-full lg:w-auto lg:min-w-[400px] p-6 md:p-10 rounded-[40px] bg-wallet-pending-bg flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      <div className="flex-1 p-6 md:p-10 rounded-[40px] bg-wallet-pending-bg">
        <EarningsBarChart
          period={period}
          onPeriodChange={setPeriod}
          thisMonthEarned={thisMonthEarned}
          lastMonthEarned={lastMonthEarned}
          thisMonthExpenses={thisMonthExpenses}
          lastMonthExpenses={lastMonthExpenses}
        />
      </div>
      <div className="w-full lg:w-auto lg:min-w-[400px] p-6 md:p-10 rounded-[40px] bg-wallet-pending-bg">
        <EarningsDonutChart
          currency={currency}
          month={month}
          onCurrencyChange={setCurrency}
          onMonthChange={setMonth}
          totalEarned={donutEarned}
          expenses={donutExpenses}
          videoEarnings={videoEarnings}
          liveClassEarnings={liveClassEarnings}
        />
      </div>
    </div>
  );
});
