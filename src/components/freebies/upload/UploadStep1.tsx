'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';

interface UploadStep1Props {
  onFilesSelected: (files: File[]) => void;
}

export function UploadStep1({ onFilesSelected }: UploadStep1Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFilesSelected(files);
    e.target.value = '';
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 rounded-[60px] border-2 border-dashed border-primary bg-primary/5 min-h-[280px] p-8 cursor-pointer select-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
      <Image src="/icons/cloud-upload.svg" alt="" width={60} height={60} />
      <p className="text-base font-medium text-text-primary">Drag and drop files here</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="flex items-center gap-2 px-6 py-4 rounded-full border border-white/20 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)] bg-primary/5 text-[rgba(229,229,229,0.95)] font-bold hover:bg-white/5 transition-colors"
      >
        <Upload size={17} />
        <span>Select files</span>
      </button>
    </div>
  );
}
