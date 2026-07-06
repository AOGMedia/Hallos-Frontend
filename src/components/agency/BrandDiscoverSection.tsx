'use client';

import { useState, lazy, Suspense, useEffect } from 'react';
import { BrandCard } from './BrandCard';
import { Globe, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompanies } from '@/hooks/useUgc';
import { Company } from '@/types/ugc';

// Lazy load modals for better performance
const BrandDetailsModal = lazy(() =>
  import('./BrandDetailsModal').then((mod) => ({
    default: mod.BrandDetailsModal,
  }))
);

const CollaborationRequestModal = lazy(() =>
  import('./CollaborationRequestModal').then((mod) => ({
    default: mod.CollaborationRequestModal,
  }))
);

interface BrandDiscoverSectionProps {
  searchQuery?: string;
  industry?: string;
  onLoading?: (isLoading: boolean) => void;
}

export function BrandDiscoverSection({ searchQuery, industry, onLoading }: BrandDiscoverSectionProps) {
  const [page, setPage] = useState(1);
  const [savedBrands, setSavedBrands] = useState<Set<string>>(new Set());
  const [selectedBrand, setSelectedBrand] = useState<Company | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // Fetch data using React Query
  const { data, isLoading, isError, error } = useCompanies({
    search: searchQuery,
    industry,
    page,
    limit: 12, // User mentioned default 13, but let's use 12 for better grid layout (4x3)
  });

  const companies = data?.companies || [];
  const pagination = data?.pagination;

  // Let parent know about loading state
  useEffect(() => {
    onLoading?.(isLoading);
  }, [isLoading, onLoading]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, industry]);

  const handleSave = (brandId: string | number) => {
    const id = String(brandId);
    setSavedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBrandClick = (id: string | number) => {
    const brand = companies.find((b) => String(b.id) === String(id));
    if (brand) {
      setSelectedBrand(brand);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const handleRequestCollaboration = () => {
    setIsDetailsModalOpen(false);
    setIsCollabModalOpen(true);
  };

  const handleViewInfoFromCollab = () => {
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsFromCollab = () => {
    setIsDetailsModalOpen(false);
  };

  const handleCloseCollabModal = () => {
    setIsCollabModalOpen(false);
    setTimeout(() => setSelectedBrand(null), 300);
  };

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white" />
            <h2 className="text-white text-xl font-bold">Discover</h2>
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-4">
              <p className="text-zinc-400 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full bg-[#252D3F] hover:bg-[#2D3548] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-full bg-[#252D3F] hover:bg-[#2D3548] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#6a57e5] animate-spin" />
            <p className="text-zinc-400 animate-pulse">Loading brands...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-400 mb-2">Error loading brands</p>
            <p className="text-zinc-500 text-sm">{error.message}</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-white text-lg font-semibold mb-2">No brands found</p>
            <p className="text-zinc-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((brand) => (
              <BrandCard
                key={brand.id}
                id={String(brand.id)}
                name={brand.companyName}
                category={brand.industry}
                website={brand.website}
                email={brand.contactEmail || ''}
                isSaved={savedBrands.has(String(brand.id))}
                onSave={handleSave}
                onClick={handleBrandClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lazy loaded modals */}
      {selectedBrand && (
        <Suspense fallback={null}>
          {isCollabModalOpen && (
            <CollaborationRequestModal
              isOpen={isCollabModalOpen}
              onClose={handleCloseCollabModal}
              brand={{
                id: String(selectedBrand.id),
                name: selectedBrand.companyName
              }}
              onViewInfo={handleViewInfoFromCollab}
            />
          )}
          {isDetailsModalOpen && (
            <BrandDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={
                isCollabModalOpen
                  ? handleCloseDetailsFromCollab
                  : handleCloseDetailsModal
              }
              brand={selectedBrand}
              isSaved={savedBrands.has(String(selectedBrand.id))}
              onSave={handleSave}
              onRequestCollaboration={handleRequestCollaboration}
            />
          )}
        </Suspense>
      )}
    </section>
  );
}
