'use client';

import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import EnrollmentTable from '@/components/admin/EnrollmentTable';
import { 
  Users, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  Video, 
  Briefcase, 
  ShieldAlert, 
  History, 
  CreditCard,
  TrendingUp,
  Package,
  BookOpen,
  Share2,
  Ticket
} from 'lucide-react';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';
import { UserSummary } from '@/services/adminDashboardService';
import { AdminCouponManagerProps } from '@/components/admin/AdminCouponManager';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AdminFeedbackModal = dynamic(() => import('@/components/admin/AdminFeedbackModal'), { ssr: false });
const AdminSessionRecordingModal = dynamic(() => import('@/components/admin/AdminSessionRecordingModal'), { ssr: false });
const AdminAgencyModal = dynamic(() => import('@/components/admin/AdminAgencyModal'), { ssr: false });
const AdminReferralModal = dynamic(() => import('@/components/admin/AdminReferralModal'), { ssr: false });
const AdminSecurityModal = dynamic(() => import('@/components/admin/AdminSecurityModal'), { ssr: false });
const AdminAuditModal = dynamic(() => import('@/components/admin/AdminAuditModal'), { ssr: false });
const AdminTransactionModal = dynamic(() => import('@/components/admin/AdminTransactionModal'), { ssr: false });
const AdminCouponManager = dynamic<AdminCouponManagerProps>(() => import('@/components/admin/AdminCouponManager'), { ssr: false });
const AdminPartnerReferralModal = dynamic(() => import('@/components/admin/AdminPartnerReferralModal'), { ssr: false });
const AdminCommunityModal = dynamic<{ isOpen: boolean; onClose: () => void }>(() => import('@/components/admin/AdminCommunityModal'), { ssr: false });

export default function AdminDashboardPage() {
  const { 
    stats, 
    loadingStats, 
    fetchStats, 
    users, 
    fetchUsers,
    enrollments,
    enrollmentSummary,
    loadingEnrollments,
    fetchEnrollments,
    modals, 
    openModal, 
    closeModal 
  } = useAdminDashboardStore();

  const [activeTab, setActiveTab] = useState<'enrollments' | 'users'>('enrollments');

  useEffect(() => {
    fetchStats();
    fetchUsers({ limit: 5 });
    fetchEnrollments({ limit: 5 });
  }, [fetchStats, fetchUsers, fetchEnrollments]);

  const userColumns: Column<UserSummary>[] = [
    {
      header: 'User',
      accessor: (user) => (
        <div className="flex items-center gap-2">
           <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
             <Users size={14}/>
           </div>
           <div>
             <div className="font-medium text-zinc-100">{user.firstname} {user.lastname}</div>
             <div className="text-[10px] text-zinc-500">{user.email}</div>
           </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (user) => (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold uppercase">
          {user.role}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: (user) => new Date(user.createdAt).toLocaleDateString()
    }
  ];

  const quickActions = [
    { label: 'Recordings', icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/10', action: () => openModal('sessionRecording') },
    { label: 'Agency Requests', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', action: () => openModal('agency') },
    { label: 'Feedbacks', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', action: () => openModal('feedback') },
    { label: 'Referrals (Legacy)', icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/10', action: () => openModal('referral') },
    { label: 'Partner Program', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', action: () => openModal('partnerReferral') },
    { label: 'Security', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10', action: () => openModal('security') },
    { label: 'Communities', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', action: () => openModal('community') },
    { label: 'Audit', icon: History, color: 'text-amber-400', bg: 'bg-amber-500/10', action: () => openModal('audit') },
    { label: 'Transactions', icon: CreditCard, color: 'text-zinc-400', bg: 'bg-zinc-500/10', action: () => openModal('transactions') },
    { label: 'Coupons', icon: Ticket, color: 'text-orange-400', bg: 'bg-orange-500/10', action: () => openModal('coupons') },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Admin Dashboard</h1>
          <p className="text-zinc-500 mt-1 italic font-medium">Monitoring platform health & user activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => { fetchStats(); fetchEnrollments(); }}
             disabled={loadingStats || loadingEnrollments}
             className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium"
          >
             <RefreshCw size={16} className={loadingStats || loadingEnrollments ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Enrollments"
          value={enrollmentSummary?.total ?? 0}
          icon={BookOpen}
          description="Successful course entries"
          color="blue"
        />
        <StatsCard
          title="Pending Credentials"
          value={enrollmentSummary?.credentialsPending ?? 0}
          icon={AlertCircle}
          description="Waiting for verification"
          color="amber"
          isWarning={!!enrollmentSummary?.credentialsPending}
        />
        <StatsCard
          title="Revenue (NGN)"
          value={`₦${(stats?.revenue?.allTime?.NGN?.total || 0).toLocaleString()}`}
          icon={TrendingUp}
          description={`${stats?.revenue?.allTime?.NGN?.count || 0} total sales`}
          color="emerald"
        />
        <StatsCard
          title="Platform Users"
          value={stats?.users?.total ?? 0}
          icon={Users}
          description={`+${stats?.users?.newToday ?? 0} today`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setActiveTab('enrollments')}
                    className={`text-sm font-bold uppercase tracking-wider transition-all border-b-2 py-2 ${
                      activeTab === 'enrollments' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Recent Enrollments
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`text-sm font-bold uppercase tracking-wider transition-all border-b-2 py-2 ${
                      activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    New Users
                  </button>
               </div>
               <Link 
                 href={activeTab === 'enrollments' ? '/admin/enrollments' : '/admin/users'} 
                 className="text-[10px] font-bold text-zinc-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors"
               >
                 View All
               </Link>
            </div>
            
            {activeTab === 'enrollments' ? (
              <EnrollmentTable enrollments={enrollments.slice(0, 5)} isLoading={loadingEnrollments} />
            ) : (
              <AdminTable 
                data={users.slice(0, 5)} 
                columns={userColumns} 
                rowKey="id"
                emptyMessage="No recent users found."
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl group hover:border-zinc-700 transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <Video size={24} />
                   </div>
                   <h3 className="font-bold text-zinc-100">Live Recording Batch</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">Send automated Google Drive recording links to students across live sessions.</p>
                <button 
                   onClick={() => openModal('sessionRecording')}
                   className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                   Open Sender
                </button>
             </div>

             <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl group hover:border-zinc-700 transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Briefcase size={24} />
                   </div>
                   <h3 className="font-bold text-zinc-100">Agency Queue</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">Review and approve UGC creator agency applications for platform onboarding.</p>
                <button 
                   onClick={() => openModal('agency')}
                   className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                   View Applications
                </button>
             </div>

             <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl group hover:border-zinc-700 transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 rounded-2xl bg-cyan-600/10 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                   </div>
                   <h3 className="font-bold text-zinc-100">Community Management</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">Manage community approvals, view active spaces, and moderate member access.</p>
                <button 
                   onClick={() => openModal('community')}
                   className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                   Manage Communities
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Quick Commands */}
        <div className="space-y-6">
           <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-4 italic">Management Commands</h2>
              <div className="grid grid-cols-1 gap-3">
                 {quickActions.map((action, idx) => (
                   <button
                     key={idx}
                     onClick={action.action}
                     className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-all group"
                   >
                     <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon size={18} />
                     </div>
                     <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-100 transition-colors uppercase tracking-tight">{action.label}</span>
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
                 <Package size={24} />
              </div>
              <h4 className="text-sm font-bold text-zinc-200 mb-2">System Resources</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-6 italic">Access documentation for internal APIs and platform management guidelines.</p>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Documentation</button>
           </div>
        </div>
      </div>

      {/* Legacy/Functional Modals */}
      {modals.feedback.isOpen && <AdminFeedbackModal isOpen={modals.feedback.isOpen} onClose={() => closeModal('feedback')} />}
      {modals.sessionRecording.isOpen && <AdminSessionRecordingModal isOpen={modals.sessionRecording.isOpen} onClose={() => closeModal('sessionRecording')} />}
      {modals.agency.isOpen && <AdminAgencyModal isOpen={modals.agency.isOpen} onClose={() => closeModal('agency')} />}
      {modals.referral.isOpen && <AdminReferralModal isOpen={modals.referral.isOpen} onClose={() => closeModal('referral')} />}

      {/* New Integration Modals */}
      {modals.security.isOpen && <AdminSecurityModal isOpen={modals.security.isOpen} onClose={() => closeModal('security')} />}
      {modals.audit.isOpen && <AdminAuditModal isOpen={modals.audit.isOpen} onClose={() => closeModal('audit')} />}
      {modals.transactions.isOpen && <AdminTransactionModal isOpen={modals.transactions.isOpen} onClose={() => closeModal('transactions')} />}
      {modals.coupons.isOpen && <AdminCouponManager isOpen={modals.coupons.isOpen} onClose={() => closeModal('coupons')} />}
      {modals.partnerReferral.isOpen && <AdminPartnerReferralModal isOpen={modals.partnerReferral.isOpen} onClose={() => closeModal('partnerReferral')} />}
      {modals.community.isOpen && <AdminCommunityModal isOpen={modals.community.isOpen} onClose={() => closeModal('community')} />}
    </div>
  );
}