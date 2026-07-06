export interface Company {
  id: number | string;
  companyName: string;
  industry: string;
  website: string;
  contactName?: string;
  contactEmail?: string;
  logo?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCompaniesResponse {
  success: boolean;
  pagination: PaginationMetadata;
  companies: Company[];
}

export interface GetIndustriesResponse {
  success: boolean;
  industries: string[];
}

export interface GetCompanyDetailsResponse {
  success: boolean;
  company: Company;
}

export interface CollaborationRequest {
  id: string;
  companyName: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'rejected' | 'responded';
  message?: string;
  company?: Company;
}

export interface SendCollaborationResponse {
  success: boolean;
  message: string;
  collaborationRequest: CollaborationRequest;
  remainingRequests: number;
}

export interface MyRequestsResponse {
  success: boolean;
  pagination: PaginationMetadata;
  requests: CollaborationRequest[];
}

// Admin Types
export interface AdminCollaborationRequest extends CollaborationRequest {
  userId: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
  };
}

export interface AdminCollaborationStats {
  totalRequests: number;
  totalCompanies: number;
  recentRequests: number;
  byStatus: Record<string, number>;
  topCompanies: {
    companyId: number;
    companyName: string;
    industry: string;
    requestCount: number;
  }[];
}

export interface GetAdminRequestsResponse {
  success: boolean;
  pagination: PaginationMetadata;
  requests: AdminCollaborationRequest[];
}

export interface GetAdminStatsResponse {
  success: boolean;
  stats: AdminCollaborationStats;
}

export interface UpdateAdminRequestResponse {
  success: boolean;
  message: string;
  request: AdminCollaborationRequest;
}
