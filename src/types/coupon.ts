export type CouponType = 'partner' | 'creator';
export type DiscountType = 'percentage' | 'flat';
export type ContentType = 'video' | 'live_class' | 'live_series' | 'course' | 'special_course';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  creatorId?: number;
  partnerUserId?: number;
  applicableContentTypes: ContentType[];
  specificContentIds?: string[] | null;
  status: CouponStatus;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Extras returned by some APIS
  totalUsages?: number;
}

export interface CouponValidationData {
  coupon: {
    id: string;
    code: string;
    type: CouponType;
    discountType: DiscountType;
    discountValue: number;
  };
  originalPrice: number;
  currency: string;
  discountAmount: number;
  finalPrice: number;
  partnerCommission?: number;
}

export interface CouponValidationResponse {
  success: boolean;
  message?: string;
  data?: CouponValidationData;
}

export interface CouponCreatePayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  applicableContentTypes: ContentType[];
  specificContentIds?: string[] | null;
  usageLimit?: number | null;
  startsAt?: string;
  expiresAt?: string | null;
}

export interface CouponUpdatePayload {
  status?: CouponStatus;
  discountType?: DiscountType;
  discountValue?: number;
  applicableContentTypes?: ContentType[];
  specificContentIds?: string[] | null;
  usageLimit?: number | null;
  startsAt?: string;
  expiresAt?: string | null;
}

export interface CouponUsageStats {
  couponId: string;
  code: string;
  type: CouponType;
  status: CouponStatus;
  totalRedemptions: number;
  totalOriginalRevenue: number;
  totalFinalRevenue: number;
  totalDiscounts: number;
  totalPartnerCommissions: number;
  usageLimit?: number | null;
  usageCount: number;
}

export interface CouponAnalyticsAggregate {
  currency: string;
  contentType: ContentType;
  totalRedemptions: number;
  totalOriginalRevenue: number;
  totalFinalRevenue: number;
  totalDiscounts: number;
  totalPartnerCommissions: number;
}

export interface TopPerformingCoupon {
  id: string;
  code: string;
  type: CouponType;
  status: CouponStatus;
  discountType: DiscountType;
  discountValue: number;
  usageCount: number;
  totalRedemptions: number;
  totalDiscounts: number;
  totalRevenue: number;
}

export interface AdminCouponAnalytics {
  aggregates: CouponAnalyticsAggregate[];
  topPerformingCoupons: TopPerformingCoupon[];
}

export interface AdminCouponUsageItem {
  id: string;
  userId: number;
  user?: {
    firstname: string;
    lastname: string;
    email: string;
  };
  purchaseId: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  partnerCommissionAmount: number;
  contentType: ContentType;
  contentId: string;
  currency: string;
  createdAt: string;
}

export interface AdminCouponUsageHistory {
  usages: AdminCouponUsageItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserPickerOption {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface AdminCouponCreatePayload extends CouponCreatePayload {
  type: CouponType;
  partnerUserId?: number | null;
  partnerCommissionPercent?: number | null;
  creatorId?: number | null;
}
