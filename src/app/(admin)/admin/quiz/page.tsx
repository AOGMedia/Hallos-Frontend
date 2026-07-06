'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LayoutDashboard, HelpCircle, Trophy, RefreshCw, LogIn, DollarSign, Activity } from 'lucide-react';
import { quizAdminService, AdminDashboardStats } from '@/services/quizAdminService';

// Reusing Admin Stats Card pattern
import StatsCard from '@/components/admin/StatsCard';

const QuizQuestionsTab = dynamic(() => import('@/components/admin/quiz/QuizQuestionsTab'), { ssr: false });
const QuizTournamentsTab = dynamic(() => import('@/components/admin/quiz/QuizTournamentsTab'), { ssr: false });
const AdjustBalanceModal = dynamic(() => import('@/components/admin/quiz/AdjustBalanceModal'), { ssr: false });

type Tab = 'dashboard' | 'questions' | 'tournaments';

export default function AdminQuizPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustBalanceOpen, setAdjustBalanceOpen] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizAdminService.getDashboardStats();
      if (data.success) {
        setStats(data);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch quiz dashboard stats', err);
      const e = err as { message?: string };
      setError(e.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
            Quiz Administration
          </h1>
          <p className="text-zinc-400 mt-1">Manage trivia tournaments, questions, and player balances.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-px overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'questions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <HelpCircle size={18} /> Questions
        </button>
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
            activeTab === 'tournaments'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <Trophy size={18} /> Tournaments
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold text-zinc-200">Platform Overview</h2>
               <button 
                  onClick={fetchDashboardStats}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
               >
                  <RefreshCw size={18} className={loading ? 'animate-spin text-blue-400' : ''} />
               </button>
            </div>

            {error && (
               <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                 {error}
               </div>
            )}

            {!loading && !stats && !error && (
               <div className="py-12 text-center text-zinc-500 border border-zinc-800/50 rounded-2xl bg-zinc-900/30">
                  <Activity className="mx-auto mb-4 opacity-50" size={32} />
                  No statistics available.
               </div>
            )}

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Ongoing Matches"
                  value={stats.ongoingMatches ?? 0}
                  icon={Activity}
                  color="blue"
                  description="Currently active games"
                />
                <StatsCard
                  title="Upcoming Tournaments"
                  value={stats.upcomingTournaments ?? 0}
                  icon={Trophy}
                  color="emerald"
                />
                <StatsCard
                  title="Buy-ins Revenue"
                  value={`₦${stats.revenueStats?.purchase?.toLocaleString() ?? 0}`}
                  icon={DollarSign}
                  color="emerald"
                  description="Gross purchases"
                />
                 <StatsCard
                  title="Total Withdrawals"
                  value={`₦${Math.abs(stats.revenueStats?.withdrawal ?? 0).toLocaleString()}`}
                  icon={LogIn}
                  color="rose"
                  description="Paid out to winners"
                />
              </div>
            )}
            
            {/* Minimal User Balance Adjustment section placeholder inline for admin quick access */}
            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                         Support Actions
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1">
                         Perform quick administrative actions on user accounts.
                      </p>
                   </div>
                   <div className="w-full md:w-auto">
                      <button 
                         onClick={() => setAdjustBalanceOpen(true)}
                         className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-900/20"
                      >
                         Adjust User Balance
                      </button>
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && <QuizQuestionsTab />}
        
        {activeTab === 'tournaments' && <QuizTournamentsTab />}
      </div>

      <AdjustBalanceModal 
         isOpen={isAdjustBalanceOpen} 
         onClose={() => setAdjustBalanceOpen(false)} 
      />
    </div>
  );
}
