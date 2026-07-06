'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import { DeleteAccountPasswordModal } from '@/components/ui/DeleteAccountPasswordModal';
import DeleteAccountModal from '@/components/ui/DeleteAccountModal';
import { Ticket, Bell } from 'lucide-react';
import { useCouponStore } from '@/store/couponStore';
import { CouponManagementModal } from '@/components/profile/CouponManagementModal';

const SettingsPage = React.memo(() => {
  const router = useRouter();
  const { isCreateModalOpen, openCreateModal, closeCreateModal } = useCouponStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePasswordSubmit = useCallback(() => {
    setShowPasswordModal(false);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting account...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/signin');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  }, [router]);

  const handleCancelDelete = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background-darker text-text-primary">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border/20">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-background-dark/50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">App Settings</h1>
        </div>

        {/* Settings Content */}
        <div className="p-4 space-y-6">
          {/* Notifications Management */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 pr-4">
              <h3 className="text-base font-medium text-text-primary mb-1">
                Notification Preferences
              </h3>
              <p className="text-sm text-text-muted leading-tight">
                Manage how you receive alerts, summaries, and personalized updates
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => router.push('/dashboard/notifications')}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Bell className="w-4 h-4" /> Manage
              </button>
            </div>
          </div>

          {/* Manage Coupons */}
          <div className="flex items-center justify-between py-4 border-t border-border/20">
            <div className="flex-1 pr-4">
              <h3 className="text-base font-medium text-text-primary mb-1">
                Coupon Management
              </h3>
              <p className="text-sm text-text-muted leading-tight">
                Create and track your promotional discount codes
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={openCreateModal}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" /> Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountPasswordModal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        onConfirm={handlePasswordSubmit}
        isLoading={isDeleting}
      />

      <DeleteAccountModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />

      <CouponManagementModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />
    </>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;