'use client';

import React, { useEffect, useState } from 'react';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import Pagination from '@/components/admin/Pagination';
import { UserSummary } from '@/services/adminDashboardService';
import { Search, Filter, User, Shield, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

const AdminUserDetailModal = dynamic(() => import('@/components/admin/AdminUserDetailModal'), {
  ssr: false,
});

export default function UsersPage() {
  const { 
    users, 
    loadingUsers, 
    paginationUsers, 
    fetchUsers,
    openModal,
    closeModal,
    modals 
  } = useAdminDashboardStore();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchUsers({ page: 1, limit: 10 });
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ search, role, page: 1 });
  };

  const handlePageChange = (page: number) => {
    fetchUsers({ search, role, page });
  }

  const columns: Column<UserSummary>[] = [
    {
      header: 'User',
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <User size={16} />
          </div>
          <div>
            <div className="font-medium text-zinc-100">{user.firstname} {user.lastname}</div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (user) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          user.role === 'admin' 
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            : user.role === 'creator'
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
        }`}>
          {user.role === 'admin' && <Shield size={12} />}
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
    },
    {
      header: 'Joined',
      accessor: (user) => new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (user) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            openModal('userDetail', { userId: user.id });
          }}
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage platform users, roles, and permissions.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </form>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <select 
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  fetchUsers({ search, role: e.target.value, page: 1 });
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="viewer">Viewer</option>
                <option value="creator">Creator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <AdminTable 
          data={users}
          columns={columns}
          isLoading={loadingUsers}
          rowKey="id"
          onRowClick={(user) => openModal('userDetail', { userId: user.id })}
          emptyMessage="No users matching your criteria were found."
        />

        <Pagination 
          currentPage={paginationUsers.page}
          totalPages={paginationUsers.totalPages}
          onPageChange={handlePageChange}
          isLoading={loadingUsers}
        />
      </div>

      <AdminUserDetailModal 
        isOpen={modals.userDetail.isOpen}
        onClose={() => closeModal('userDetail')}
      />
    </div>
  );
}
