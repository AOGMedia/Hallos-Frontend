import { Enrollment } from '@/services/adminService';
import { BadgeCheck, BadgeAlert, Eye } from 'lucide-react';
import Link from 'next/link';

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  isLoading?: boolean;
}

export default function EnrollmentTable({ enrollments, isLoading }: EnrollmentTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading enrollments...</div>;
  }

  if (enrollments.length === 0) {
    return <div className="p-8 text-center text-zinc-500">No enrollments found.</div>;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
            <th className="p-4 font-medium">Student</th>
            <th className="p-4 font-medium">Course</th>
            <th className="p-4 font-medium">Amount</th>
            <th className="p-4 font-medium">Date</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-zinc-300 text-sm">
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
              <td className="p-4">
                <div className="font-medium text-zinc-100">{enrollment.studentName}</div>
                <div className="text-xs text-zinc-500">{enrollment.studentEmail}</div>
              </td>
              <td className="p-4">
                <div className="font-medium max-w-xs truncate" title={enrollment.course?.name || 'Unknown Course'}>
                  {enrollment.course?.name || 'Unknown Course'}
                </div>
                <div className="text-xs text-zinc-500">{enrollment.course?.department?.name || 'No Department'}</div>
              </td>
              <td className="p-4 font-mono">
                {enrollment.currency} {enrollment.amount?.toLocaleString() ?? 0}
              </td>
              <td className="p-4 text-zinc-400">
                {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </td>
              <td className="p-4">
                {enrollment.credentialsSent ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BadgeCheck size={14} /> Sent
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <BadgeAlert size={14} /> Pending
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <Link
                  href={`/admin/enrollments/${enrollment.id}`}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="View Details"
                >
                  <Eye size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
