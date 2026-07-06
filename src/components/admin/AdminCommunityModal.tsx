/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, CheckCircle, XCircle, Ban, Trash2, Users } from 'lucide-react';
import { 
  useAdminCommunities, 
  useApproveCommunity, 
  useRejectCommunity, 
  useSuspendCommunity, 
  useDeleteAdminCommunity 
} from '@/hooks/useAdminCommunityAPI';
import Image from 'next/image';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';

interface AdminCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommunityModal({ isOpen, onClose }: AdminCommunityModalProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useAdminDashboardStore();

  const { data, isLoading } = useAdminCommunities({
    status: activeTab === 'all' ? undefined : activeTab,
    name: searchQuery || undefined,
    page,
    limit: 10,
  });

  const approveMutation = useApproveCommunity();
  const rejectMutation = useRejectCommunity();
  const suspendMutation = useSuspendCommunity();
  const deleteMutation = useDeleteAdminCommunity();

  const communities = data?.data?.communities || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const TABS = [
    { id: 'all', label: 'All Communities' },
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === 'approve') await approveMutation.mutateAsync(id);
      if (action === 'reject') await rejectMutation.mutateAsync(id);
      if (action === 'suspend') await suspendMutation.mutateAsync(id);
      if (action === 'delete') {
        if (confirm('Are you sure you want to permanently delete this community?')) {
          await deleteMutation.mutateAsync(id);
        }
      }
      showToast(`Community ${action}d successfully`, 'success');
    } catch (error: unknown) {
      showToast((error as Error).message || `Failed to ${action} community`, 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'suspended': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'rejected': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Community Management" maxWidth="max-w-[1000px]">
      
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/50">
                <th className="px-6 py-4 font-bold">Community</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Visibility</th>
                <th className="px-6 py-4 font-bold text-center">Members</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      Loading communities...
                    </div>
                  </td>
                </tr>
              ) : communities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                    No communities found matching your criteria.
                  </td>
                </tr>
              ) : (

                communities.map((community: any) => (
                  <tr key={community.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={community.thumbnailUrl || community.thumbnail || '/placeholder-community.jpg'} 
                          alt="" 
                          width={40} 
                          height={40} 
                          className="rounded-lg object-cover bg-zinc-800 border border-zinc-700" 
                        />
                        <div>
                          <p className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors line-clamp-1">{community.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Created {new Date(community.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(community.status)}`}>
                        {community.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400 capitalize flex items-center gap-1.5">
                        <Users size={12} className={community.visibility === 'public' ? 'text-emerald-400' : 'text-amber-400'} />
                        {community.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-zinc-300">{community.memberCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {community.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction('approve', community.id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction('reject', community.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {community.status === 'active' && (
                          <button 
                            onClick={() => handleAction('suspend', community.id)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Suspend"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction('delete', community.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors ml-auto"
                          title="Delete Community"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </Modal>
  );
}
