'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyVideos, deleteVideo, type VideoListItem } from '@/lib/api/videos';
import { VideoCard } from '@/components/dashboard/VideoCard';
import { ShortVideoCard } from '@/components/dashboard/ShortVideoCard';
import { EmptyState } from '@/components/uploads/EmptyState';
import { UploadingState } from '@/components/uploads/UploadingState';
import Image from 'next/image';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AlertModal } from '@/components/ui/AlertModal';

type TabType = 'videos' | 'shorts';

export default function UploadsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleDeleteVideo = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      await deleteVideo(id);
      queryClient.invalidateQueries({ queryKey: ['user-videos-all'] });
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const errorObj = err as { hasPurchases?: boolean; message?: string };
        if (errorObj.hasPurchases) {
          setAlertMessage("This video has been purchased by users and cannot be deleted. Please contact support.");
        } else {
          setAlertMessage(errorObj.message || "Failed to delete content. Please try again.");
        }
      } else if (err instanceof Error) {
        setAlertMessage(err.message || "Failed to delete content. Please try again.");
      } else {
        setAlertMessage("Failed to delete content. Please try again.");
      }
    }
  };

  const { data: allMyVideos, isLoading: isLoadingAll } = useQuery({
    queryKey: ['user-videos-all'],
    queryFn: () => getMyVideos(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });

  const isLoading = isLoadingAll;
  const currentData: VideoListItem[] = (allMyVideos || []).filter((v) => {
    if (activeTab === 'shorts') return v.type === 'short';
    return v.type !== 'short';
  });

  // Separate videos by status
  const uploadingItems = currentData?.filter(item => item.status === 'uploading') || [];
  const readyItems = currentData?.filter(item => item.status === 'ready') || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-12">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-colors ${
            activeTab === 'videos'
              ? 'bg-[#1f2636] bg-opacity-[0.04]'
              : 'bg-transparent'
          }`}
        >
          <Image
            src="/icons/video-library.svg"
            alt=""
            width={20}
            height={16}
            className="w-5 h-4"
          />
          <span
            className={`text-base font-medium ${
              activeTab === 'videos' ? 'text-[#f2f2f2]' : 'text-[#888c94]'
            }`}
          >
            My videos
          </span>
        </button>

        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-colors ${
            activeTab === 'shorts'
              ? 'bg-[#1f2636] bg-opacity-[0.04]'
              : 'bg-transparent'
          }`}
        >
          <Image
            src="/icons/video-play.svg"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span
            className={`text-base font-medium ${
              activeTab === 'shorts' ? 'text-[#f2f2f2]' : 'text-[#888c94]'
            }`}
          >
            My Shorts
          </span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[#f2f2f2]">Loading...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Uploading Items */}
          {uploadingItems.length > 0 && (
            <div className="flex flex-wrap gap-12">
              {uploadingItems.map((item) => (
                <UploadingState
                  key={item.id}
                  title={item.title}
                  type={activeTab}
                  onDelete={() => handleDeleteVideo(item.id)}
                />
              ))}
            </div>
          )}

          {/* Ready Items */}
          {readyItems.length > 0 ? (
            activeTab === 'videos' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {readyItems.map((v) => (
                  <VideoCard
                    key={v.id}
                    variant="grid"
                    showPrice={v.price !== undefined && v.price > 0}
                    video={{
                      id: v.id,
                      title: v.title,
                      description: v.description || '',
                      thumbnail: v.thumbnailUrl || '/images/video-thumbnail-1.svg',
                      author: 'You',
                      authorAvatar: '/images/instructor-avatar.jpg',
                      isLive: false,
                      duration: Math.max(0, v.durationSeconds ?? 0),
                      postedDate: v.createdAt ? new Date(v.createdAt) : new Date(),
                      rating: 0,
                      ratingCount: 0,
                      price: v.price,
                      currency: v.currency,
                      userId: v.userId, // User's own content - should have access
                    }}
                    onDelete={() => handleDeleteVideo(v.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {readyItems.map((s) => (
                  <ShortVideoCard
                    key={s.id}
                    variant="grid"
                    short={{
                      id: s.id,
                      title: s.title,
                      thumbnail: s.thumbnailUrl || '/images/video-thumbnail-1.svg',
                      views: s.viewsCount ?? 0,
                    }}
                    onDelete={() => handleDeleteVideo(s.id)}
                  />
                ))}
              </div>
            )
          ) : uploadingItems.length === 0 ? (
            
            <EmptyState type={activeTab} />
            
          ) : null}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Content?"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isDestructive={true}
      />
      <AlertModal 
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        message={alertMessage || ""}
      />
    </div>
  );
}