export type FreebieTab = 'top' | 'saved' | 'mine';

export type FreebieItemType = 'file' | 'link';

export interface FreebieItem {
  id: string;
  itemType: FreebieItemType;
  // If file
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  // If link
  linkUrl?: string | null;
  linkTitle?: string | null;
  downloadCount: number;
  isFreePreview: boolean;
}

export interface CreatorMinimal {
  id: number;
  firstname?: string;
  lastname?: string;
  name?: string; // We'll compute this or use firstname+lastname
  avatar?: string; // Local fallback
}

export interface Freebie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  estimatedReadingTime: number;
  downloadCount: number;
  price: number;
  currency: string;
  pricing?: {
    ngn: number;
    usd: number;
  };
  createdAt: string;
  // Based on list response vs detail response:
  // In list it might be creatorName, creatorId. In detail it might be an object.
  // We'll normalize this in the store or handle it gracefully.
  creatorName?: string;
  creatorId?: number;
  creator?: CreatorMinimal; 
  items?: FreebieItem[]; // Only present in detail response, or empty in list
  // Computed fields (local state)
  saved?: boolean;
  purchased?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
