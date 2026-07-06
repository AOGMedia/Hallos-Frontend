'use client';

import { memo, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import FileUploadIcon from '@/components/icons/FileUploadIcon';

interface LiveEventThumbnailUploadProps {
  file: File | null;
  preview: string | null;
  onFileSelect: (file: File, preview: string) => void;
}

export const LiveEventThumbnailUpload = memo(function LiveEventThumbnailUpload({
  // file,
  preview,
  onFileSelect
}: LiveEventThumbnailUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onFileSelect(imageFile, result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onFileSelect(selectedFile, result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (preview) {
    return (
      <div className={`${preview?" flex flex-col items-center justify-center gap-4":"live-event-upload-zone flex flex-col items-center justify-center gap-4"}`}>
        <Image 
          src={preview} 
          alt="Thumbnail preview" 
          width={320}
          height={200}
          className="max-h-[200px] rounded-lg object-contain"
        />
        <button
          type="button"
          onClick={handleClick}
          className="text-sm cursor-pointer text-primary live-event-button-text px-8 rounded-full hover:opacity-90 transition-opacity"
        >
          Change
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`live-event-upload-zone flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
        isDragging ? 'border-primary bg-primary/10' : ''
      }`}
      onClick={handleClick}
    >
      <FileUploadIcon width={20} height={16} color="#F2F2F2" />
      <p className="live-event-upload-text text-center">
        Drag and drop file here
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <button
        type="button"
        className="bg-primary text-white live-event-button-text px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
      >
        Select file
      </button>
    </div>
  );
});