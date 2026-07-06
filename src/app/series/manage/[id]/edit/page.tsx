"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSeriesDetails, updateSeries } from '@/services/seriesService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { 
  TitleField, 
  DescriptionField, 
  PriceField, 
  CategoryField, 
  PrivacyField, 
  MaxParticipantsField,
  ThumbnailSection 
} from '@/components/videoUpload/steps/GoLiveParts';
import { CurrencyCode } from '@/types/videoUpload';
import { AlertModal } from '@/components/ui/AlertModal';

export default function EditSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { userId } = useCurrentUser();

  // Fetch series details
  const { 
    data: series, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['series-edit', id],
    queryFn: () => getSeriesDetails(id),
    enabled: !!id,
  });

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(CurrencyCode.NGN);
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [endDate, setEndDate] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; isError: boolean }>({ 
    open: false, 
    message: "",
    isError: false
  });

  // Check if user is creator
  const isCreator = useMemo(() => {
    if (!userId || !series) return false;
    const userIdStr = String(userId);
    const seriesUserIdStr = String(series.userId);
    console.log('Edit page - Checking creator:', { 
      userId: userIdStr, 
      seriesUserId: seriesUserIdStr, 
      match: userIdStr === seriesUserIdStr 
    });
    return userIdStr === seriesUserIdStr;
  }, [userId, series]);

  // Populate form when series data loads
  useEffect(() => {
    if (series) {
      setTitle(series.title);
      setDescription(series.description || '');
      
      // Price is already in main currency format
      const priceValue = typeof series.price === 'string'
        ? parseFloat(series.price).toString()
        : series.price.toString();
      setPrice(priceValue);
      
      setCurrency(series.currency === 'USD' ? CurrencyCode.USD : CurrencyCode.NGN);
      setCategory(series.category || '');
      setPrivacy(series.privacy);
      setMaxParticipants(String(series.maxParticipants));
      setThumbnailPreview(series.thumbnailUrl || null);
      setEndDate(series.endDate ? series.endDate.split('T')[0] : '');
    }
  }, [series]);

  // Redirect if not creator (only after we have both userId and series data)
  useEffect(() => {
    if (!isLoading && series && userId && !isCreator) {
      console.log('Not creator, redirecting from edit page...');
      router.push(`/series/${id}`);
    }
  }, [isLoading, series, userId, isCreator, router, id]);

  const handleThumbnailSelect = (file: File, preview: string) => {
    setThumbnail(file);
    setThumbnailPreview(preview);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setAlertState({ open: true, message: 'Title is required', isError: true });
      return;
    }

    // endDate can only be extended, not shortened
    if (endDate && series?.endDate) {
      const originalEnd = new Date(series.endDate);
      const newEnd = new Date(endDate);
      if (newEnd < originalEnd) {
        setAlertState({ open: true, message: 'End date can only be extended forward, not shortened.', isError: true });
        return;
      }
    }

    setIsSaving(true);
    
    try {
      // Prepare update body
      const updateBody = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        category: category || undefined,
        privacy,
        maxParticipants: parseInt(maxParticipants),
        endDate: endDate || undefined,
      };

      console.log('Updating series:', updateBody);

      const response = await updateSeries(id, updateBody, thumbnail || undefined);

      if (response.success) {
        setAlertState({
          open: true,
          message: 'Series updated successfully!',
          isError: false
        });
        
        // Navigate back to management page after short delay
        setTimeout(() => {
          router.push(`/series/manage/${id}`);
        }, 1500);
      } else {
        setAlertState({
          open: true,
          message: response.message || 'Failed to update series',
          isError: true
        });
      }
    } catch (err) {
      console.error('Error updating series:', err);
      setAlertState({
        open: true,
        message: err instanceof Error ? err.message : 'An error occurred while updating',
        isError: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading series...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !series) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load series</p>
          <Button variant="secondary" onClick={() => router.push(`/series/manage/${id}`)}>
            Back to Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <button 
              onClick={() => router.push('/dashboard/classes')}
              className="hover:text-text-primary transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <button 
              onClick={() => router.push(`/series/manage/${id}`)}
              className="hover:text-text-primary transition-colors"
            >
              Manage Series
            </button>
            <span>/</span>
            <span className="text-text-primary">Edit</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
            Edit Series
          </h1>
          <p className="text-text-muted text-sm">
            Update series information. Note: Schedule and recurrence pattern cannot be changed after creation.
          </p>
        </div>

        {/* Edit Form */}
        <div className="bg-background-card p-6 rounded-lg space-y-6">
          <TitleField value={title} onChange={setTitle} />

          <DescriptionField value={description} onChange={setDescription} />

          <PriceField 
            currency={currency} 
            onCurrencyChange={setCurrency} 
            price={price} 
            onPriceChange={setPrice} 
          />

          <CategoryField value={category} onChange={setCategory} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PrivacyField value={privacy} onChange={setPrivacy} />
            <MaxParticipantsField 
              value={maxParticipants} 
              onChange={setMaxParticipants} 
              streamingProvider="zegocloud"
            />
          </div>

          <ThumbnailSection 
            file={thumbnail} 
            preview={thumbnailPreview} 
            onFileSelect={handleThumbnailSelect} 
          />

          {/* End Date - extendable only */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">
              End Date
              <span className="text-text-muted font-normal ml-2 text-xs">(can only be extended forward)</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={series.endDate ? series.endDate.split('T')[0] : undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-primary [color-scheme:dark]"
            />
            <p className="text-xs text-text-muted">
              Current end date: {new Date(series.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Cannot be changed:</h3>
            <ul className="text-sm text-text-muted space-y-1">
              <li>• Start date: {new Date(series.startDate).toLocaleDateString()}</li>
              <li>• Schedule: {series.recurrencePattern.days.join(', ')}</li>
              <li>• Session time: {series.recurrencePattern.startTime} ({series.recurrencePattern.duration} mins)</li>
              <li>• Currency: {series.currency}</li>
              <li>• Total sessions: {series.stats?.totalSessions || 0}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button 
              variant="secondary" 
              onClick={() => router.push(`/series/manage/${id}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal 
        isOpen={alertState.open}
        onClose={() => setAlertState({ open: false, message: "", isError: false })}
        message={alertState.message}
      />
    </div>
  );
}
