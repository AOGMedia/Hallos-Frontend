'use client';

import { useRef, useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';

interface LinkInput {
  url: string;
  title: string;
  isFreePreview: boolean;
}

interface FileInput {
  file: File;
  isFreePreview: boolean;
}

interface UploadStep2Props {
  files: FileInput[];
  links: LinkInput[];
  onRemoveFile: (index: number) => void;
  onToggleFilePreview: (index: number) => void;
  onAddMoreFiles: (files: File[]) => void;
  onAddLink: (link: LinkInput) => void;
  onToggleLinkPreview: (index: number) => void;
  onRemoveLink: (index: number) => void;
}

export function UploadStep2({ 
  files, links, onRemoveFile, onToggleFilePreview, onAddMoreFiles, onAddLink, onToggleLinkPreview, onRemoveLink 
}: UploadStep2Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [isLinkPreview, setIsLinkPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length) onAddMoreFiles(newFiles);
    e.target.value = '';
  };

  const handleApplyLink = () => {
    if (linkUrl.trim() && linkTitle.trim()) {
      onAddLink({ url: linkUrl.trim(), title: linkTitle.trim(), isFreePreview: isLinkPreview });
      setLinkUrl('');
      setLinkTitle('');
      setIsLinkPreview(false);
      setShowLinkInput(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-primary">
          Upload files and/or add links
        </p>
        <p className="text-xs text-text-gray/80 leading-relaxed">
          Allowed formats: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX.<br />
          Maximum file size is 50MB. At least one file or link is required.
        </p>
      </div>

      <div className="rounded-[40px] border-2 border-dashed border-primary bg-primary/5 min-h-[200px] p-6">
        <div className="flex flex-wrap gap-4">
          {files.map((item, i) => (
            <div
              key={`file-${i}`}
              className="flex flex-col gap-2 p-3 rounded-md border border-white/40 bg-white/5 backdrop-blur-sm w-full sm:w-[calc(50%-0.5rem)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Upload size={14} className="text-text-gray shrink-0" />
                  <span className="text-sm font-semibold text-[#eaeaea] truncate">{item.file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  aria-label="Remove file"
                  className="text-text-gray hover:text-text-primary transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={item.isFreePreview}
                  onChange={() => onToggleFilePreview(i)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-primary"
                />
                <span className="text-[11px] text-text-gray group-hover:text-text-primary transition-colors">
                  Mark as Free Preview
                </span>
              </label>
            </div>
          ))}

          {links.map((link, i) => (
            <div
              key={`link-${i}`}
              className="flex flex-col gap-2 p-3 rounded-md border border-white/40 bg-white/5 backdrop-blur-sm w-full sm:w-[calc(50%-0.5rem)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon size={14} className="text-blue-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#eaeaea] truncate leading-tight">{link.title}</span>
                    <span className="text-[10px] text-text-gray truncate">{link.url}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLink(i)}
                  aria-label="Remove link"
                  className="text-text-gray hover:text-text-primary transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={link.isFreePreview}
                  onChange={() => onToggleLinkPreview(i)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-primary"
                />
                <span className="text-[11px] text-text-gray group-hover:text-text-primary transition-colors">
                  Mark as Free Preview
                </span>
              </label>
            </div>
          ))}
        </div>
        <input 
          ref={inputRef} 
          type="file" 
          multiple 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {showLinkInput ? (
        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row items-end gap-3 w-full">
            <div className="flex flex-col gap-1 w-full flex-1">
              <label className="text-xs text-text-gray">Link Title</label>
              <input 
                value={linkTitle} 
                onChange={(e) => setLinkTitle(e.target.value)} 
                placeholder="e.g. YouTube Tutorial"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-1 w-full flex-1">
              <label className="text-xs text-text-gray">URL</label>
              <input 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                placeholder="https://..."
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isLinkPreview}
                  onChange={(e) => setIsLinkPreview(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent accent-primary"
                />
                <span className="text-sm text-text-gray group-hover:text-text-primary transition-colors">
                  Available as Free Preview
                </span>
             </label>

             <div className="flex items-center gap-3 w-full sm:w-auto">
               <button 
                  type="button"
                  onClick={handleApplyLink}
                  disabled={!linkUrl.trim() || !linkTitle.trim()}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors flex-1 sm:flex-none"
               >
                  Add
               </button>
               <button 
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-colors shrink-0"
               >
                  Cancel
               </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
           <button
             type="button"
             onClick={() => inputRef.current?.click()}
             className="flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-primary/5 text-white text-xs font-bold hover:bg-white/5 transition-colors flex-1 sm:flex-none"
           >
             <Upload size={16} /> Add Files
           </button>
           <button
             type="button"
             onClick={() => setShowLinkInput(true)}
             className="flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors flex-1 sm:flex-none"
           >
             <LinkIcon size={16} /> Add Link
           </button>
        </div>
      )}
    </div>
  );
}

export { UploadStep2 as default };
