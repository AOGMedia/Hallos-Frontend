'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';

interface ThumbnailUploadProps {
  onFileSelect: (file: File, preview: string) => void;
  preview: string | null;
}

export function ThumbnailUpload({ onFileSelect, preview }: ThumbnailUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onFileSelect(file, result);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start ">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-dashed transition-all ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-primary bg-primary/[0.06]'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 20C3.45 20 2.97933 19.8043 2.588 19.413C2.19667 19.0217 2.00067 18.5507 2 18V6C2 5.45 2.196 4.97933 2.588 4.588C2.98 4.19667 3.45067 4.00067 4 4H20C20.55 4 21.021 4.196 21.413 4.588C21.805 4.98 22.0007 5.45067 22 6V18C22 18.55 21.8043 19.021 21.413 19.413C21.0217 19.805 20.5507 20.0007 20 20H4ZM10 18H20V6H10V18ZM8 18V6H4V18H8Z" fill="#F2F2F2"/>
</svg>

        {/* <ImagePlus size={40} className="text-text-primary" /> */}
        
        <p className="text-regular text-text-primary text-center text-sm">
          Drag and drop file here
        </p>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="bg-primary text-white text-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm">
            Select file
          </div>
        </label>
      </div>

      {preview && (
        <div className=" flex-1 w-full md:w-48 h-50 rounded-2xl overflow-hidden border border-border">
          <Image 
            src={preview} 
            alt="Thumbnail preview" 
            width={192}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}