'use client';

import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCourseGradient } from '@/lib/courseVisuals';
import { useState } from 'react';
import { useSendCollaboration } from '@/hooks/useUgc';

interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: {
    id: string;
    name: string;
  };
  onViewInfo?: () => void;
}

export function CollaborationRequestModal({
  isOpen,
  onClose,
  brand,
  onViewInfo,
}: CollaborationRequestModalProps) {
  const [pitch, setPitch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: sendRequest, isPending, isError, error, data } = useSendCollaboration();

  if (!isOpen) return null;

  const firstLetter = brand.name.charAt(0).toUpperCase();
  const gradient = getCourseGradient(brand.id);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  const handleSend = () => {
    if (pitch.length < 50) return;
    
    sendRequest(
      { companyId: brand.id, message: pitch },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            onClose();
            setShowSuccess(false);
            setPitch('');
          }, 3000);
        }
      }
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#1C2333] rounded-3xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          boxShadow:
            '-40px 0 60px rgba(106, 87, 229, 0.35), 40px 0 60px rgba(106, 87, 229, 0.35), 0 20px 40px rgba(106, 87, 229, 0.20)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5">
          <button
            onClick={onClose}
            className="text-white hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-bold text-xl">
            Request Collaboration
          </h2>
        </div>

        {/* Brand Info */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
          <div
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: gradient.gradient }}
          >
            <span
              className="text-lg font-bold"
              style={{ color: gradient.textColor }}
            >
              {firstLetter}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{brand.name}</h3>
            <button
              onClick={onViewInfo}
              className="text-[#6a57e5] text-sm hover:text-[#7d6bf0] transition-colors"
            >
              View info
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Request Sent!</h3>
              <p className="text-zinc-400 max-w-xs mx-auto mb-4">
                Collaboration request sent successfully! You have been CC&apos;d on the email.
              </p>
              {data && (
                <div className="bg-[#252D3F] rounded-lg p-3 text-sm text-zinc-300">
                  <p><strong>Request ID:</strong> {data.collaborationRequest?.id || 'N/A'}</p>
                  <p className="mt-1"><strong>Status:</strong> {data.collaborationRequest?.status || 'Pending'}</p>
                  <p className="mt-1"><strong>Remaining Requests:</strong> {data.remainingRequests}</p>
                  {data.message && <p className="mt-2 text-green-400">{data.message}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-white text-sm font-medium">
                    Type pitch here
                  </label>
                  <span className={`text-xs ${pitch.length >= 50 ? 'text-green-500' : 'text-zinc-500'}`}>
                    {pitch.length}/50 characters minimum
                  </span>
                </div>
                <textarea
                  value={pitch}
                  onChange={(e) => {
                    setPitch(e.target.value);
                  }}
                  disabled={isPending}
                  placeholder="Tell the brand why they should collaborate with you..."
                  className="w-full h-[200px] bg-[#252D3F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#6a57e5] transition-colors resize-none disabled:opacity-50"
                />
              </div>

              {isError && error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Failed to send request</p>
                    <p className="text-xs mt-1 opacity-80">
                      {error.message || 'An unexpected error occurred'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showSuccess && (
          <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleSend}
              disabled={pitch.length < 50 || isPending}
              className="flex-1 bg-[#6a57e5] hover:bg-[#7d6bf0] disabled:bg-[#6a57e5]/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
