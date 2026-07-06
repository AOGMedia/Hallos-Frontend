/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutGrid, Check, X } from 'lucide-react';

interface SubmissionsTabProps {
  isAdmin: boolean;
  mySubmissions: any[];
  queueItems: any[];
  communityId: string;
  onApproveSubmission: (submissionId: string) => void;
  onRejectSubmission: (submissionId: string, reason: string) => void;
}

const typeLabel: Record<string, string> = {
  live_class: 'Live Class',
  class: 'Live Class',
  live_series: 'Live Series',
  series: 'Live Series',
  video: 'Video',
  freebie: 'Resource',
  resource: 'Resource',
};

export function SubmissionsTab({
  isAdmin,
  mySubmissions,
  queueItems,
  onApproveSubmission,
  onRejectSubmission,
}: SubmissionsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {!isAdmin ? (
        mySubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <LayoutGrid size={24} className="text-primary" />
            </div>
            <p className="text-base font-semibold text-text-primary">No Submissions Yet</p>
            <p className="text-sm text-text-gray max-w-xs">
              Submit content to this community and track its review status here.
            </p>
          </div>
        ) : (
          mySubmissions.map((item: any) => {
            const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
              pending:     { bg: 'bg-yellow-400/10', text: 'text-yellow-400',  label: 'Pending Review' },
              approved:    { bg: 'bg-green-400/10',  text: 'text-green-400',   label: 'Approved' },
              rejected:    { bg: 'bg-red-400/10',    text: 'text-red-400',     label: 'Rejected' },
              resubmitted: { bg: 'bg-blue-400/10',   text: 'text-blue-400',    label: 'Resubmitted' },
            };
            const s = statusConfig[item.status] || { bg: 'bg-white/10', text: 'text-text-gray', label: item.status };
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-background-dark p-5 flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary truncate">
                    {item.contentData?.title || item.title || 'Untitled Submission'}
                  </h4>
                  <p className="text-xs text-text-gray uppercase tracking-wider">
                    {typeLabel[item.contentType] || item.contentType}
                    {' '}•{' '}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                  {item.status === 'rejected' && item.rejectionReason && (
                    <p className="text-sm text-red-400 mt-1">Reason: {item.rejectionReason}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
              </div>
            );
          })
        )
      ) : queueItems.length === 0 ? (
        <p className="text-text-gray text-center py-12">No pending submissions yet.</p>
      ) : (
        queueItems.map((item: any) => {
          const statusConfig: Record<string, { bg: string; text: string }> = {
            pending:     { bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
            approved:    { bg: 'bg-green-400/10',  text: 'text-green-400' },
            rejected:    { bg: 'bg-red-400/10',    text: 'text-red-400' },
            resubmitted: { bg: 'bg-blue-400/10',   text: 'text-blue-400' },
          };
          const s = statusConfig[item.status] || { bg: 'bg-white/10', text: 'text-text-gray' };
          const submitterName = item.submitter
            ? `${item.submitter.firstname || ''} ${item.submitter.lastname || ''}`.trim() ||
              item.submitter.email
            : null;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-background-dark p-5 flex items-start justify-between gap-4"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="font-bold text-text-primary truncate">
                  {item.contentData?.title || item.title || 'Untitled Submission'}
                </h4>
                <p className="text-xs text-text-gray uppercase tracking-wider">
                  {typeLabel[item.contentType] || item.contentType}
                  {' '}•{' '}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
                {submitterName && (
                  <p className="text-xs text-text-gray mt-1">
                    By: <span className="text-text-primary font-medium">{submitterName}</span>
                    {item.submitter?.email && (
                      <span className="text-text-gray"> • {item.submitter.email}</span>
                    )}
                  </p>
                )}
                {item.status === 'rejected' && item.rejectionReason && (
                  <p className="text-sm text-red-400 mt-1">Reason: {item.rejectionReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${s.bg} ${s.text}`}>
                  {item.status}
                </span>
                {(item.status === 'pending' || item.status === 'resubmitted') && (
                  <>
                    <button
                      onClick={() => onApproveSubmission(item.id)}
                      className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) onRejectSubmission(item.id, reason);
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
