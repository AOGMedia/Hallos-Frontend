'use client';

import React, { useEffect, useState, useCallback } from 'react';
import EnrollmentTable from '@/components/admin/EnrollmentTable';
import EnrollmentFilters from '@/components/admin/EnrollmentFilters';
import { adminService, Enrollment } from '@/services/adminService';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    credentialsSent: '',
    departmentId: ''
  });

  const handleExport = () => {
    // Construct export URL with current filters
    const params = new URLSearchParams();
    params.append('format', 'csv');
    if (filters.search) params.append('search', filters.search);
    if (filters.credentialsSent) params.append('credentialsSent', filters.credentialsSent);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    
    // Trigger download
    // Using direct window.location or a hidden link is standard for file downloads
    const token = localStorage.getItem('token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://prod-api.aahbibi.com/api'}/api/admin/course-enrollments/export?${params.toString()}`;
    
    // For authenticated downloads, we might need to use fetch with blob, 
    // but standard link with token in query param (if supported) or just relying on cookie/auth header if browser handles it.
    // Since we're using JWT in headers, simple link click might not work without a special backend support for query param token 
    // OR we use axios to download blob.
    
    // Let's use the axios approach via adminService if we were to implement it there, 
    // or just a fetch here for simplicity.
    
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enrollments-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(err => console.error('Export failed', err));
  };


  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getEnrollments({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (data.success) {
        setEnrollments(data.enrollments);
        setPagination(prev => ({ 
            ...prev, 
            total: data.pagination.total, 
            pages: data.pagination.pages 
        }));
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => {
        // Only update if changed to avoid unnecessary re-renders
        if (JSON.stringify(prev) === JSON.stringify({ ...prev, ...newFilters })) return prev;
        return { ...prev, ...newFilters };
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Enrollments</h1>
          <p className="text-zinc-400 mt-1">Manage course access and student records.</p>
        </div>
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
        >
            <Download size={18} />
            Export CSV
        </button>
      </div>

      <EnrollmentFilters onFilterChange={handleFilterChange} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <EnrollmentTable enrollments={enrollments} isLoading={loading} />
        
        {/* Pagination Controls */}
        {!loading && pagination.total > 0 && (
          <div className="flex justify-between items-center p-4 border-t border-zinc-800 text-sm md:text-base">
            <div className="text-zinc-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="flex items-center px-4 bg-zinc-800 rounded-lg text-zinc-300 font-medium">
                  Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
