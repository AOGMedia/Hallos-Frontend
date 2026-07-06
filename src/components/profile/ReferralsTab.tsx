'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyReferralStats, getMyReferralEarnings, generateReferralLink } from '@/lib/api/referral';
import { Users, Link as LinkIcon, DollarSign, Activity, ChevronLeft, ChevronRight, Copy, CheckCircle2 } from 'lucide-react';

const LIMIT = 10;

export function ReferralsTab() {
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const offset = (page - 1) * LIMIT;

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: getMyReferralStats,
  });

  const { data: earningsData, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ['referral-earnings', page],
    queryFn: () => getMyReferralEarnings({ offset, limit: LIMIT }),
    placeholderData: (prev) => prev,
  });

  const { data: linkData, isLoading: isLoadingLink } = useQuery({
    queryKey: ['referral-link'],
    queryFn: generateReferralLink,
    staleTime: Infinity,
  });

  const referralLink = linkData?.referralLink || linkData?.data?.referralLink;

  const handleCopy = useCallback(async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink]);

  if (isLoadingStats || isLoadingEarnings || isLoadingLink) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = statsData?.stats;
  const earnings = earningsData?.commissions || [];
  const total = earningsData?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 min-w-0 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-text-primary">My Referrals</h2>
        <p className="text-text-muted">Earn commissions every time a friend purchases using your referral link.</p>
      </div>

      {/* Copy Link Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          Your Unique Referral Link
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-background-darker border border-white/10 rounded-lg px-4 py-3 text-text-primary truncate">
            {referralLink || 'Unavailable'}
          </div>
          <button
            onClick={handleCopy}
            disabled={!referralLink}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-muted">Total Earnings</span>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            ₦{stats?.totalEarnings?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-muted">Pending</span>
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            ₦{stats?.pendingCommissions?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-muted">Total Referrals</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {stats?.totalReferrals?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-muted">Link Clicks</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {stats?.totalClicks?.toLocaleString() ?? 0}
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden min-w-0">
        <div className="px-4 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-text-primary">Commission History</h3>
        </div>

        {earnings.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No referral commissions yet.</p>
            <p className="text-sm mt-1">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-sm text-text-muted font-medium">
                  <th className="px-4 py-3">Referred User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {earnings.map((record) => (
                  <tr key={record.id} className="text-sm text-text-primary hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{record.referee.firstname} {record.referee.lastname}</div>
                      <div className="text-text-muted text-xs truncate max-w-[120px] sm:max-w-[180px]">
                        {record.referee.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      ₦{record.commissionAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'paid'
                          ? 'bg-green-500/10 text-green-500'
                          : record.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-500'
                          : record.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap hidden sm:table-cell">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Page <span className="font-medium text-text-primary">{page}</span> of{' '}
              <span className="font-medium text-text-primary">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
