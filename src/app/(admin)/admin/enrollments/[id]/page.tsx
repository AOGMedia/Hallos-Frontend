'use client';

import React, { useEffect, useState } from 'react';
import { adminService, Enrollment } from '@/services/adminService';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Mail, Phone, User, Book, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function EnrollmentDetailsPage() {
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Decode ID if it was encoded in URL, though optional for UUIDs usually
        const decodedId = decodeURIComponent(id as string);
        const data = await adminService.getEnrollmentDetails(decodedId);
        if (data.success) {
          setEnrollment(data.enrollment);
        } else {
             // Handle not found
             console.error('Enrollment not found');
        }
      } catch (err) {
        console.error('Failed to load enrollment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleMarkSent = async () => {
    if (!enrollment) return;
    try {
      setActionLoading(true);
      const newState = !enrollment.credentialsSent;
      const data = await adminService.markCredentialsSent(enrollment.id, newState);
      if (data.success) {
        setEnrollment(prev => prev ? ({ ...prev, credentialsSent: newState, credentialsSentAt: data.enrollment.credentialsSentAt }) : null);
      }
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      // Log server response details if available
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response) {
          console.error('Server Error Response:', error.response.data);
          alert(`Failed: ${error.response.data?.message || 'Server Error'}`);
      } else {
          alert('Failed to update status. Please check your connection.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">Loading details...</div>;
  }

  if (!enrollment) {
    return (
        <div className="text-center py-20">
            <h2 className="text-xl text-zinc-400">Enrollment not found</h2>
            <Link href="/admin/enrollments" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">Back to List</Link>
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link href="/admin/enrollments" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={18} /> Back to Enrollments
      </Link>

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
            Enrollment #{enrollment.id}
            {enrollment.credentialsSent ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle size={14} /> Credentials Sent
              </span>
            ) : (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2">
                <Clock size={14} /> Pending Action
              </span>
            )}
          </h1>
          <p className="text-zinc-400 mt-2">Placed on {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleString() : 'N/A'}</p>
        </div>

        <button
          onClick={handleMarkSent}
          disabled={actionLoading}
          className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
            enrollment.credentialsSent
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
          }`}
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             <ShieldCheck size={20} />
          )}
          {enrollment.credentialsSent ? 'Mark as Pending' : 'Mark Credentials Sent'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <User className="text-blue-400" size={24} /> Student Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Full Name</label>
              <div className="text-zinc-200 text-lg">{enrollment.studentName}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</label>
              <div className="text-zinc-200 flex items-center gap-2">
                <Mail size={16} className="text-zinc-500" />
                <a href={`mailto:${enrollment.studentEmail}`} className="hover:text-blue-400">{enrollment.studentEmail}</a>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Phone Number</label>
              <div className="text-zinc-200 flex items-center gap-2">
                <Phone size={16} className="text-zinc-500" />
                {enrollment.studentPhone || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Book className="text-purple-400" size={24} /> Course Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Course Name</label>
              <div className="text-zinc-200 text-lg font-semibold">{enrollment.course?.name || 'Unknown Course'}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Department</label>
              <div className="text-zinc-300">{enrollment.course?.department?.name || 'No Department'}</div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 md:col-span-2">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CreditCard className="text-emerald-400" size={24} /> Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount Paid</label>
              <div className="text-2xl font-mono font-bold text-zinc-100">
                  {enrollment.currency} {enrollment.amount?.toLocaleString() ?? 0}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Payment Provider</label>
              <div className="text-zinc-200 capitalize">{enrollment.paymentProvider}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Reference ID</label>
              <div className="text-zinc-200 font-mono text-sm bg-zinc-950 p-2 rounded border border-zinc-800">
                  {enrollment.paymentReference}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
