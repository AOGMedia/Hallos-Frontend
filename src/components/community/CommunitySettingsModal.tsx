'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, Shield, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { useUpdateCommunity, useDeleteCommunity, useTransferOwnership } from '@/hooks/useCommunityAPI';
import type { Community } from '@/types/community';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
}

export function CommunitySettingsModal({ isOpen, onClose, community }: CommunitySettingsModalProps) {
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description || '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(community.visibility || 'public');
  
  const [poster, setPoster] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(community.thumbnailUrl || community.thumbnail || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [transferUserId, setTransferUserId] = useState('');

  const updateMutation = useUpdateCommunity();
  const deleteMutation = useDeleteCommunity();
  const transferMutation = useTransferOwnership();

  useEffect(() => {
    if (isOpen) {
      setName(community.name);
      setDescription(community.description || '');
      setVisibility(community.visibility || 'public');
      setPreviewUrl(community.thumbnailUrl || community.thumbnail || null);
      setPoster(null);
    }
  }, [isOpen, community]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoster(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      id: community.id,
      payload: { 
        name, 
        description, 
        visibility, 
        poster: poster || undefined 
      }
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const handleTransfer = () => {
    if (!transferUserId) return;
    transferMutation.mutate({ id: community.id, newOwnerId: transferUserId }, {
      onSuccess: () => {
        setTransferUserId('');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this community? This action cannot be undone and requires the community to be empty of content and other members.')) {
      deleteMutation.mutate(community.id, {
        onSuccess: () => {
          onClose();
          // Typically redirect to dashboard here
        }
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Community Settings" maxWidth="max-w-[600px]">
      <div className="flex flex-col gap-8">
        
        {/* General Settings */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-text-primary">General</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-gray">Community Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="live-event-input text-text-primary text-sm placeholder-text-muted/60 w-full outline-none focus:border-primary transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-gray">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3} 
              className="live-event-input text-text-primary text-sm placeholder-text-muted/60 w-full outline-none resize-none focus:border-primary transition-colors" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-gray">Community Thumbnail</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-border hover:border-primary transition-all cursor-pointer overflow-hidden group bg-background-dark/50"
            >
              {previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Upload size={24} />
                      <span className="text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-gray group-hover:text-primary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-border/30 flex items-center justify-center">
                    <ImageIcon size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">Upload Image</p>
                    <p className="text-[10px]">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-gray">Visibility</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setVisibility('public')}
                className={`flex-1 py-2 px-4 rounded-xl border transition-all ${
                  visibility === 'public'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-text-gray hover:border-text-gray'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`flex-1 py-2 px-4 rounded-xl border transition-all ${
                  visibility === 'private'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-text-gray hover:border-text-gray'
                }`}
              >
                Private
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end mt-2">
            <button 
              onClick={handleUpdate}
              disabled={updateMutation.isPending || name.trim() === ''}
              className="px-6 py-2 rounded-full bg-primary text-white font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
          {updateMutation.isError && <p className="text-red-400 text-sm mt-1">{updateMutation.error.message}</p>}
        </div>

        <hr className="border-border" />

        {/* Danger Zone */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h3>
          
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div>
                <h4 className="text-base font-medium text-text-primary flex items-center gap-2">
                  <Shield size={16} className="text-text-gray" /> Transfer Ownership
                </h4>
                <p className="text-xs text-text-gray mt-1 max-w-[300px]">
                  Transfer ownership to another member. You will become a regular member.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <input 
                  placeholder="Member ID" 
                  value={transferUserId}
                  onChange={e => setTransferUserId(e.target.value)}
                  className="live-event-input text-sm py-1.5 px-3 bg-background-dark border-white/10 w-full sm:w-32" 
                />
                <button 
                  onClick={handleTransfer}
                  disabled={transferMutation.isPending || !transferUserId.trim()}
                  className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </div>
            {transferMutation.isError && <p className="text-red-400 text-xs">{transferMutation.error.message}</p>}
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/20">
            <div>
              <h4 className="text-base font-medium text-text-primary">Delete Community</h4>
              <p className="text-xs text-text-gray mt-1 max-w-[300px]">
                Permanently delete this community. Requires community to be empty.
              </p>
            </div>
            <button 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          </div>
          {deleteMutation.isError && <p className="text-red-400 text-sm">{deleteMutation.error.message}</p>}
        </div>

      </div>
    </Modal>
  );
}
