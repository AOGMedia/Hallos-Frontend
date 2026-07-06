import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { BookmarkCheck, Clock, File as FileIcon, X, Link as LinkIcon, Loader2, Download, Trash2, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFreebiesStore } from '@/store/freebiesStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { CurrencySelect } from '@/components/videoUpload/CurrencySelect';
import { CurrencyCode } from '@/types/videoUpload';
import type { FreebieItem } from '@/types/freebie';
import { Edit2, Check, RotateCcw } from 'lucide-react';
import { useFreebieDetail, useUpdateFreebiePrice, useDeleteFreebie, usePurchaseFreebie, freebieKeys } from '@/hooks/useFreebies';
import { usePaymentStore } from '@/store/paymentStore';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  freebieId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const getFileIcon = (item: FreebieItem) => {
  if (item.itemType === 'link') return '/icons/freebie-file.svg';
  
  const type = item.fileType?.toLowerCase() || '';
  if (type.includes('pdf')) return '/icons/file-pdf.svg';
  if (type.includes('word') || type.includes('document')) return '/icons/file-doc.svg';
  if (type.includes('excel') || type.includes('spreadsheet')) return '/icons/file-xls.svg';
  if (type.includes('powerpoint') || type.includes('presentation')) return '/icons/file-ppt.svg';
  if (type.includes('mp4') || type.includes('video')) return '/icons/file-mp4.svg';
  
  return '/icons/freebie-file.svg';
};

export function FreebieDetailModal({ freebieId, isOpen, onClose }: Props) {
  const { toggleSaveLocally, savedIds } = useFreebiesStore();
  const { userId } = useCurrentUser();
  const { hasAccess: hasStoredAccess, markContentAsPurchased } = usePaymentStore();
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  // Incremented when payment-storage changes in another tab, forcing hasAccess to recompute
  const [, setStorageTick] = useState(0);
  
  // Data Fetching via React Query (Rule 1, 2, 7)
  const { data: freebie, isLoading: isDetailsLoading } = useFreebieDetail(freebieId);

  // Mutations (Rule 5)
  const updatePriceMutation = useUpdateFreebiePrice();
  const deleteMutation = useDeleteFreebie();
  const purchaseMutation = usePurchaseFreebie();

  // Multi-currency & Price Editing State
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(CurrencyCode.NGN);
  const [currencyInitialised, setCurrencyInitialised] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('0');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>(CurrencyCode.NGN);

  // Normalise a raw currency string (e.g. 'usd', 'Usd') to a CurrencyCode enum value
  const normaliseCurrency = (raw: string | undefined): CurrencyCode => {
    const upper = raw?.toUpperCase();
    return (upper === CurrencyCode.USD ? CurrencyCode.USD : CurrencyCode.NGN);
  };

  // Client-side price conversion matching backend CurrencyConversionService (1 USD = 1400 NGN)
  const NGN_TO_USD_RATE = 1400;
  const convertPrice = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return amount;
    if (from === CurrencyCode.NGN && to === CurrencyCode.USD) return Math.round((amount / NGN_TO_USD_RATE) * 100) / 100;
    if (from === CurrencyCode.USD && to === CurrencyCode.NGN) return Math.round(amount * NGN_TO_USD_RATE * 100) / 100;
    return amount;
  };

  // Sync state when freebie data is loaded/changed — only initialise currency once
  // to avoid resetting a user's manual selection on background refetches
  useEffect(() => {
    if (freebie) {
      const normCurrency = normaliseCurrency(freebie.currency);
      if (!currencyInitialised) {
        setSelectedCurrency(normCurrency);
        setCurrencyInitialised(true);
      }
      setNewPrice(freebie.price.toString());
      setNewCurrency(normCurrency);
    }
  }, [freebie]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset initialisation flag when modal closes so next open starts fresh
  useEffect(() => {
    if (!isOpen) setCurrencyInitialised(false);
  }, [isOpen]);

  // Listen for payment store changes from other tabs (e.g. Stripe verify page)
  // When markContentAsPurchased runs in the verify tab, Zustand writes to
  // localStorage under 'payment-storage', triggering this event in the original tab.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'payment-storage') {
        setStorageTick(t => t + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isOwner = freebie?.creatorId !== undefined && String(freebie.creatorId) === String(userId);
  const isSaved = freebieId ? savedIds.includes(freebieId) : false;
  const hasAccess = isOwner || freebie?.price === 0 || freebie?.purchased
    || (freebieId ? hasStoredAccess('freebie', freebieId, userId) : false);

  const handlePurchase = async () => {
    if (!freebie || purchaseMutation.isPending) return;
    const currency = selectedCurrency || CurrencyCode.NGN;
    setPurchaseError(null);
    try {
      const res = await purchaseMutation.mutateAsync({ id: freebie.id, currency });
      if (res.success && res.data) {
        const url = res.data.authorizationUrl || res.data.sessionUrl;
        if (url) window.open(url, '_blank');
      }
    } catch (err) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; alreadyPurchased?: boolean } } };
      const status = axiosErr?.response?.status;
      const body = axiosErr?.response?.data;

      // 409 = already purchased — grant access locally and refresh
      if (status === 409 || body?.alreadyPurchased) {
        markContentAsPurchased('freebie', freebie.id, userId);
        queryClient.invalidateQueries({ queryKey: freebieKeys.detail(freebie.id) });
        queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
        return;
      }

      console.error('Failed to initiate purchase:', err);
      setPurchaseError(body?.message || 'Purchase failed. Please try again.');
    }
  };

  const handleUpdatePrice = async () => {
    if (!freebie) return;
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum)) return;

    try {
      await updatePriceMutation.mutateAsync({ 
        id: freebie.id, 
        price: priceNum, 
        currency: newCurrency 
      });
      setIsEditingPrice(false);
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const handleDelete = async () => {
    if (!freebie) return;
    try {
      await deleteMutation.mutateAsync(freebie.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  const handleDownload = async (item: FreebieItem) => {
    if (!hasAccess && !item.isFreePreview) {
      handlePurchase();
      return;
    }

    setDownloadingId(item.id);
    try {
      const { freebiesService } = await import('@/services/freebiesService');
      const res = await freebiesService.getDownloadUrl(item.id);
      if (res.success && res.url) {
        window.open(res.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to download item:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const creatorName = freebie?.creator?.name || freebie?.creatorName || (freebie?.creator?.firstname ? `${freebie.creator.firstname} ${freebie.creator.lastname || ''}` : 'Anonymous');

  return (
    <>
      <AnimatePresence>
      {isOpen && freebie && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75"
          onClick={handleBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-[760px] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col gap-6 sm:gap-8 bg-[#131927] rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 text-text-gray hover:text-text-primary transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Delete — only for owner */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
                aria-label="Delete library item"
                className="absolute top-4 right-12 p-1.5 text-red-400 hover:text-red-300 transition-colors z-10 disabled:opacity-50"
              >
                {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            )}

            {/* ── Breadcrumb header ── */}
            <div className="flex items-center gap-2 pr-8">
              <h2 className="text-xl sm:text-[32px] font-medium text-text-primary leading-tight truncate">
                {isDetailsLoading ? 'Loading detail...' : freebie?.title}
              </h2>
            </div>

            {/* ── Top dark card: Title + Reading/Files + Save ── */}
            <div className="rounded-[16px] sm:rounded-[20px] bg-background-dark px-4 sm:px-8 py-5 sm:py-8 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-normal text-[rgba(234,234,234,0.50)]">Title</span>
                  <div className="flex items-center gap-1 py-1.5 min-w-0">
                    <div className="w-px h-4 bg-[#eaeaea] shrink-0" />
                    <span className="text-sm font-semibold text-[#eaeaea] truncate">{freebie.title}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex flex-col gap-1 items-start sm:items-end">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <span className="text-sm font-normal text-[rgba(234,234,234,0.50)]">Price</span>
                    {isOwner && !isEditingPrice && (
                      <button 
                        onClick={() => setIsEditingPrice(true)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={10} /> Edit
                      </button>
                    )}
                  </div>

                  {isEditingPrice ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 flex items-center gap-2">
                        <CurrencySelect 
                          value={newCurrency} 
                          onChange={(curr) => setNewCurrency(curr)} 
                        />
                        <input 
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="bg-transparent text-sm font-bold text-white w-20 outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleUpdatePrice}
                        disabled={updatePriceMutation.isPending}
                        className="p-1.5 rounded-full bg-primary text-white disabled:opacity-50"
                      >
                        {updatePriceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button 
                        onClick={() => setIsEditingPrice(false)}
                        className="p-1.5 rounded-full bg-white/10 text-white"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                        freebie.price > 0 ? 'bg-primary text-white' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {freebie.price > 0 ? (
                          <>
                            {selectedCurrency} {
                              convertPrice(freebie.price, normaliseCurrency(freebie.currency), selectedCurrency)
                            }
                          </>
                        ) : 'FREE'}
                      </div>
                      
                      {freebie.price > 0 && !isOwner && (
                        <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                          <CurrencySelect 
                            value={selectedCurrency} 
                            onChange={(curr) => setSelectedCurrency(curr)} 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reading + Files + Save — stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Reading + Files */}
                <div className="flex flex-col xs:flex-row flex-wrap gap-3 flex-1">
                  {/* Reading */}
                  <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                    <span className="text-xs font-semibold text-[rgba(234,234,234,0.50)]">Reading</span>
                    <div
                      className="flex items-center gap-2 rounded-md backdrop-blur-[60px] px-3 py-2.5"
                      style={{ background: 'rgba(234,234,234,0.06)' }}
                    >
                      <Clock width={20} height={20} className="shrink-0" />
                      <div className="w-px h-4 bg-[#eaeaea]/30 shrink-0" />
                      <span className="text-sm font-semibold text-[#eaeaea]">{freebie.estimatedReadingTime}min</span>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                    <span className="text-xs font-semibold text-[rgba(234,234,234,0.50)]">Files</span>
                    <div
                      className="flex items-center gap-2 rounded-md backdrop-blur-[60px] px-3 py-2.5"
                      style={{ background: 'rgba(234,234,234,0.06)' }}
                    >
                      <FileIcon width={20} height={20} className="shrink-0" />
                      <div className="w-px h-4 bg-[#eaeaea]/30 shrink-0" />
                      <span className="text-sm font-semibold text-[#eaeaea]">{freebie.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>

                {/* Buy / Save buttons */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    {!hasAccess && (
                      <button
                        onClick={handlePurchase}
                        disabled={purchaseMutation.isPending}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {purchaseMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                        <span>Buy Now</span>
                      </button>
                    )}
                    <button
                      onClick={() => freebie && toggleSaveLocally(freebie.id)}
                      aria-label="Save to library"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.30)] bg-white/5 text-[rgba(229,229,229,0.95)] font-bold hover:bg-white/10 transition-colors"
                    >
                      <BookmarkCheck width={15} height={17} className={isSaved ? 'text-primary' : ''} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                  {purchaseError && (
                    <p className="text-xs text-red-400 leading-snug max-w-xs">{purchaseError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── About + Creator ── */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* About */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <p className="text-sm font-medium text-text-gray">About this Library item</p>
                <p className="text-sm sm:text-base font-medium text-text-gray leading-[1.5]">
                  {freebie.description}
                </p>
              </div>

              {/* Creator */}
              <div className="flex sm:flex-col gap-2 sm:gap-2.5 sm:min-w-[160px] items-center sm:items-start">
                <p className="text-sm font-medium text-text-gray shrink-0">Creator</p>
                <div className="flex items-center gap-2.5">
                  {freebie.creator?.avatar ? (
                    <Image
                      src={freebie.creator.avatar}
                      alt={creatorName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover shrink-0 bg-zinc-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
                      {creatorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm sm:text-base font-medium text-text-gray">{creatorName}</span>
                </div>
              </div>
            </div>

            {/* ── Items (Files & Links) ── */}
            <div className="flex flex-col gap-3 pb-2">
              <p className="text-sm font-medium text-text-gray">Items</p>
              {isDetailsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
              ) : freebie?.items?.length === 0 ? (
                <p className="text-xs text-text-gray/50 italic">No files or links associated.</p>
              ) : freebie?.items?.map((item) => {
                const isLocked = !hasAccess && !item.isFreePreview;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={getFileIcon(item)}
                      alt={item.itemType}
                      width={21}
                      height={24}
                      className="shrink-0"
                    />
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm sm:text-base font-medium text-text-gray truncate">
                        {item.itemType === 'link' ? item.linkTitle || item.linkUrl : item.fileName}
                      </span>
                      {item.isFreePreview && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Free Preview</span>
                      )}
                    </div>
                    
                    {item.fileSize !== undefined && item.fileSize !== null && (
                      <span className="text-xs font-normal text-text-gray shrink-0">
                        {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                      aria-label={isLocked ? "Unlock required" : item.itemType === 'link' ? "Open Link" : "Download File"}
                      className={`shrink-0 transition-opacity ml-1 disabled:opacity-50 ${isLocked ? 'text-primary' : 'text-text-gray hover:text-text-primary'}`}
                    >
                      {downloadingId === item.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : item.isFreePreview && !hasAccess ? (
                        <Unlock className="w-5 h-5 text-emerald-400" />
                      ) : item.itemType === 'link' ? (
                        <LinkIcon className="w-5 h-5" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Library Item?"
        message="This will permanently delete this item and all its files from the library. This action cannot be undone."
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive
      />
    </>
  );
}
