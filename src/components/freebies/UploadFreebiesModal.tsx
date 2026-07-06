'use client';

import { useCallback, useState } from 'react';
import { ArrowLeft, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadStep1 } from './upload/UploadStep1';
import { UploadStep2 } from './upload/UploadStep2';
import { UploadStep3 } from './upload/UploadStep3';
import { useFreebiesStore } from '@/store/freebiesStore';
import { useQueryClient } from '@tanstack/react-query';
import { freebieKeys } from '@/hooks/useFreebies';

interface UploadFreebiesModalProps {
  /** Display title, e.g. "Upload freebies" */
  title?: string;
  onSuccess?: () => void;
}

const STEP_LABELS = ['Files', 'Preview', 'Details'];

export function UploadFreebiesModal({
  title = 'Upload to Library',
  onSuccess,
}: UploadFreebiesModalProps) {
  const queryClient = useQueryClient();
  const {
    isUploadModalOpen, uploadStep, uploadedFiles, uploadedLinks,
    isUploading, uploadError,
    closeUpload, nextUploadStep, prevUploadStep,
    addFiles, toggleFilePreview, removeFile, addLink, toggleLinkPreview, removeLink,
    handleUpload
  } = useFreebiesStore();

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('NGN');

  const handleFilesSelected = (files: File[]) => {
    addFiles(files);
    nextUploadStep();
  };

  const handleNext = async () => {
    if (uploadStep === 3) {
      if (!readingTime || isNaN(Number(readingTime))) return;
      
      const result = await handleUpload(formTitle, formDesc, Number(readingTime), Number(price) || 0, currency);
      if (result.success) {
        if (result.message) {
          alert(result.message);
        }
        queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
        onSuccess?.();
        setFormTitle('');
        setFormDesc('');
        setReadingTime('');
        setPrice('0');
        setCurrency('NGN');
      }
    } else {
      nextUploadStep();
    }
  };

  const handleClose = useCallback(() => {
    closeUpload();
    setFormTitle('');
    setFormDesc('');
    setReadingTime('');
    setPrice('0');
    setCurrency('NGN');
  }, [closeUpload]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose(); },
    [handleClose]
  );

  const canNext =
    uploadStep === 1 ? false : // step1 uses drag/click, no Next btn
    uploadStep === 2 ? (uploadedFiles.length > 0 || uploadedLinks.length > 0) :
    !!(formTitle.trim() && formDesc.trim() && readingTime.trim());

  return (
    <AnimatePresence>
      {isUploadModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75"
          onClick={handleBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full sm:max-w-2xl lg:max-w-3xl flex flex-col gap-6"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {/* Title row */}
            <div className="flex items-center gap-2.5 px-2  sm:flex">
              {uploadStep > 1 && (
                <button onClick={prevUploadStep} aria-label="Back" className="text-text-gray hover:text-text-primary transition-colors">
                  <ArrowLeft size={19} />
                </button>
              )}
              <h2 className="text-2xl font-medium text-text-primary/60">{title}</h2>
            </div>

            {/* Main card */}
            <div className="rounded-t-[28px] sm:rounded-[28px] bg-background-dark px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
              {/* Mobile title + back */}
              <div className="flex items-center gap-2.5 sm:hidden">
                {uploadStep > 1 && (
                  <button onClick={prevUploadStep} aria-label="Back" className="text-text-gray hover:text-text-primary transition-colors">
                    <ArrowLeft size={19} />
                  </button>
                )}
                <h2 className="text-lg font-medium text-text-primary/60">{title}</h2>
              </div>

              {/* Progress nav */}
              <div className="flex items-center gap-4">
                {STEP_LABELS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isActive = uploadStep >= stepNum;
                  const isCurrent = uploadStep === stepNum;
                  return (
                    <div key={label} className="flex items-center gap-4">
                      <span
                        className={`text-sm sm:text-base font-medium px-3 py-1 rounded-full transition-colors ${
                          isCurrent
                            ? 'bg-primary text-white'
                            : isActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-text-gray border border-white/10'
                        }`}
                      >
                        {stepNum}. {label}
                      </span>
                      {idx < STEP_LABELS.length - 1 && (
                        <div className={`border-t-2 border-dashed w-8 ${isActive && uploadStep > stepNum ? 'border-primary' : 'border-text-gray/40'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={uploadStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {uploadStep === 1 && <UploadStep1 onFilesSelected={handleFilesSelected} />}
                  {uploadStep === 2 && (
                    <UploadStep2
                      files={uploadedFiles}
                      links={uploadedLinks}
                      onRemoveFile={removeFile}
                      onToggleFilePreview={toggleFilePreview}
                      onAddMoreFiles={addFiles}
                      onAddLink={addLink}
                      onToggleLinkPreview={toggleLinkPreview}
                      onRemoveLink={removeLink}
                    />
                  )}
                  {uploadStep === 3 && (
                    <div className="flex flex-col gap-4">
                      {uploadError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                          {uploadError}
                        </div>
                      )}
                      <UploadStep3
                        title={formTitle}
                        description={formDesc}
                        estimatedReadingTime={readingTime}
                        price={price}
                        currency={currency}
                        onTitleChange={setFormTitle}
                        onDescriptionChange={setFormDesc}
                        onEstimatedReadingTimeChange={setReadingTime}
                        onPriceChange={setPrice}
                        onCurrencyChange={setCurrency}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex items-center gap-4">


                {uploadStep > 1 && (
                  <button
                    type="button"
                    onClick={prevUploadStep}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <ArrowLeft size={18} />
                    <span>Prev</span>
                  </button>
                )}

                {uploadStep !== 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext || isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0 ml-auto"
                  >
                    <span>{uploadStep === 3 ? (isUploading ? 'Uploading...' : 'Submit') : 'Next'}</span>
                    {!isUploading && <ArrowRight size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-text-gray hover:text-text-primary transition-colors z-10"
            >
              <X size={22} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
