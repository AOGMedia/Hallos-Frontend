'use client';

import React, { useEffect, useState } from 'react';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';
import { Payout } from '@/services/adminDashboardService';
import { CheckCircle, XCircle, Clock, Banknote, Filter } from 'lucide-react';

export default function PayoutsPage() {
  const { 
    payouts, 
    loadingPayouts, 
    paginationPayouts, 
    fetchPayouts,
    approvePayout,
    rejectPayout 
  } = useAdminDashboardStore();

  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPayouts({ page: 1, limit: 10 });
  }, [fetchPayouts]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    fetchPayouts({ status: newStatus, page: 1 });
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this payout? This will initiate the bank transfer.')) {
      const success = await approvePayout(id);
      if (success) alert('Payout approved and transfer initiated');
      else alert('Failed to approve payout');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      const success = await rejectPayout(id, reason);
      if (success) alert('Payout rejected');
      else alert('Failed to reject payout');
    }
  };

  const columns: Column<Payout>[] = [
    {
      header: 'Recipient',
      accessor: (payout) => (
        <div>
          <div className="font-medium text-zinc-100">{payout.user.firstname} {payout.user.lastname}</div>
          <div className="text-xs text-zinc-500">{payout.user.email}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (payout) => (
        <div>
          <div className="font-mono text-zinc-100 font-bold">
            {payout.currency} {payout.amount.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">Net: {payout.netAmount.toLocaleString()}</div>
        </div>
      ),
    },
    {
      header: 'Bank Details',
      accessor: (payout) => (
        <div className="text-xs">
          <div className="font-medium text-zinc-300">{payout.bankName}</div>
          <div className="text-zinc-500">{payout.accountNumber}</div>
          <div className="text-zinc-500">{payout.accountName}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (payout) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          payout.status === 'completed' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : payout.status === 'pending'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : payout.status === 'processing'
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {payout.status === 'completed' && <CheckCircle size={12} />}
          {payout.status === 'pending' && <Clock size={12} />}
          {payout.status === 'processing' && <Clock size={12} className="animate-spin" />}
          {payout.status === 'failed' && <XCircle size={12} />}
          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (payout) => (
        payout.status === 'pending' ? (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleApprove(payout.id)}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              title="Approve"
            >
              <CheckCircle size={18} />
            </button>
            <button 
              onClick={() => handleReject(payout.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              title="Reject"
            >
              <XCircle size={18} />
            </button>
          </div>
        ) : payout.failureReason ? (
          <div className="text-xs text-red-400 max-w-[150px] truncate" title={payout.failureReason}>
            {payout.failureReason}
          </div>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Payout Management</h1>
          <p className="text-zinc-400 mt-1">Review and approve withdrawal requests from creators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Clock size={20} /></div>
               <h3 className="font-bold text-zinc-100">Pending Requests</h3>
             </div>
             <p className="text-3xl font-bold text-zinc-100">7</p>
             <p className="text-zinc-500 text-xs mt-1">Requiring review</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Banknote size={20} /></div>
               <h3 className="font-bold text-zinc-100">Pending Amount</h3>
             </div>
             <p className="text-3xl font-bold text-zinc-100">₦350,000</p>
             <p className="text-zinc-500 text-xs mt-1">Total pending payout</p>
          </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-zinc-500" />
            <span className="text-sm font-medium text-zinc-300">Filter Status:</span>
          </div>
          
          <div className="flex items-center gap-2">
            {['', 'pending', 'processing', 'completed', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  status === s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AdminTable 
          data={payouts}
          columns={columns}
          isLoading={loadingPayouts}
          rowKey="id"
          emptyMessage="No payouts found for the selected status."
        />

        <Pagination 
          currentPage={paginationPayouts.page}
          totalPages={paginationPayouts.totalPages}
          onPageChange={(page) => fetchPayouts({ status, page })}
          isLoading={loadingPayouts}
        />
      </div>
    </div>
  );
}
