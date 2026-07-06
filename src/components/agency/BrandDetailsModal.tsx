'use client';

import { Bookmark, Copy, X } from 'lucide-react';
import { getCourseGradient } from '@/lib/courseVisuals';
import { useCompanyDetails } from '@/hooks/useUgc';
import Image from 'next/image';

import { Company } from '@/types/ugc';

interface BrandDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Company;
  isSaved?: boolean;
  onSave?: (id: string | number) => void;
  onRequestCollaboration?: (brandId: string | number) => void;
}

export function BrandDetailsModal({
  isOpen,
  onClose,
  brand: initialBrand,
  isSaved = false,
  onSave,
  onRequestCollaboration,
}: BrandDetailsModalProps) {
  const { data: detailsData, isLoading } = useCompanyDetails(isOpen ? initialBrand.id : null);
  
  // Merge initial info with full details when available
  const brand = detailsData?.company || initialBrand;

  if (!isOpen) return null;

  const firstLetter = brand.companyName.charAt(0).toUpperCase();
  const gradient = getCourseGradient(String(brand.id));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#1C2333] rounded-3xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{
          boxShadow: '-40px 0 60px rgba(106, 87, 229, 0.35), 40px 0 60px rgba(106, 87, 229, 0.35), 0 20px 40px rgba(106, 87, 229, 0.20)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
           <div className="flex items-center gap-3">
            <div
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: !brand.logo ? gradient.gradient : undefined }}
            >
              {brand.logo ? (
                <Image 
                  src={brand.logo} 
                  alt={brand.companyName} 
                  width={60}
                  height={60}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span
                  className="text-2xl font-bold"
                  style={{ color: gradient.textColor }}
                >
                  {firstLetter}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-bold text-xl">{brand.companyName}</h2>
              {isLoading && <span className="text-xs text-[#6a57e5] animate-pulse">Updating details...</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#252D3F] hover:bg-[#2D3548] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name and Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#8B8B8B] text-sm mb-2 block">Name</label>
              <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white">
                {brand.companyName}
              </div>
            </div>
            <div>
              <label className="text-[#8B8B8B] text-sm mb-2 block">
                Industry
              </label>
              <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white">
                {brand.industry}
              </div>
            </div>
          </div>

          {/* Location and Website */}
          <div className="grid grid-cols-2 gap-4">
            {brand.location && (
              <div>
                <label className="text-[#8B8B8B] text-sm mb-2 block">
                  Location
                </label>
                <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white">
                  {brand.location}
                </div>
              </div>
            )}
            <div className={brand.location ? '' : 'col-span-2'}>
              <label className="text-[#8B8B8B] text-sm mb-2 block">
                Website
              </label>
              <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white flex items-center justify-between">
                <span className="truncate">{brand.website}</span>
                <button
                  onClick={() => handleCopyToClipboard(brand.website)}
                  className="ml-2 text-[#6a57e5] hover:text-[#7d6bf0] transition-colors flex-shrink-0"
                >
                <Copy/>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Name and Email */}
          <div className="grid grid-cols-2 gap-4">
            {brand.contactName && (
              <div>
                <label className="text-[#8B8B8B] text-sm mb-2 block">
                  Contact name
                </label>
                <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white">
                  {brand.contactName}
                </div>
              </div>
            )}
            <div className={brand.contactName ? '' : 'col-span-2'}>
              <label className="text-[#8B8B8B] text-sm mb-2 block">
                Contact email
              </label>
              <div className="bg-[#252D3F] rounded-lg px-4 py-3 text-white flex items-center justify-between">
                <span className="truncate">{brand.contactEmail}</span>
                <button
                  onClick={() => handleCopyToClipboard(brand.contactEmail || '')}
                  className="ml-2 text-[#6a57e5] hover:text-[#7d6bf0] transition-colors flex-shrink-0"
                >
                <Copy/>
                </button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {brand.socialLinks && (
            <div className="bg-[#252D3F] rounded-lg px-4 py-3 flex items-center gap-3">
              {brand.socialLinks.twitter && (
                <a
                  href={brand.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1C2333] hover:bg-[#2D3548] flex items-center justify-center transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
              {brand.socialLinks.instagram && (
                <a
                  href={brand.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1C2333] hover:bg-[#2D3548] flex items-center justify-center transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
              {brand.socialLinks.tiktok && (
                <a
                  href={brand.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1C2333] hover:bg-[#2D3548] flex items-center justify-center transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="border-2 border-dashed border-[#6a57e5]/30 rounded-lg p-4">
            <p className="text-[#8B8B8B] text-sm text-center">
              Your{' '}
              <span className="text-[#6a57e5] font-semibold">portfolio</span>{' '}
              will be pitched when you request collaboration. They will be
              notified and can review your profile for potential collaboration.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 flex items-center gap-4">
          <button
            onClick={() => onRequestCollaboration?.(brand.id)}
            className="flex-1 bg-[#6a57e5] hover:bg-[#7d6bf0] text-white font-semibold py-3 px-6 rounded-full transition-colors"
          >
            Request Collaboration
          </button>
          <button
            onClick={() => onSave?.(String(brand.id))}
            className="w-12 h-12 rounded-full bg-[#252D3F] hover:bg-[#2D3548] flex items-center justify-center transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 transition-colors ${
                isSaved ? 'fill-[#6a57e5] text-[#6a57e5]' : 'text-white'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
