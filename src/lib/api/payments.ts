import { apiClient } from './client'

export type ContentType = 'video' | 'live' | 'live_class' | 'special_course' | 'course' | 'live_series' | 'freebie'
export type PaymentGateway = 'paystack' | 'stripe'

export interface CheckAccessResponse {
  success: boolean
  hasAccess: boolean
  reason?: string
  price?: string
  currency?: string
}

export interface InitializePaymentResponse {
  success: boolean
  message?: string
  currency?: string
  gateway?: PaymentGateway
  requiredGateway?: PaymentGateway
  cached?: boolean
  freeAccess?: boolean
  couponApplied?: boolean
  couponCode?: string
  amount?: number
  purchase?: {
    id: string
    userId: string | number
    contentType: ContentType
    contentId: string
    amount: number
    currency: string
    paymentGateway: PaymentGateway
    paymentReference: string
    paymentStatus: string
  }
  pricing?: {
    currency: string
    regularPrice: number
    finalPrice: number
    discount: number
    discountPercentage: number
    couponApplied: boolean
  }
  data?: {
    authorizationUrl?: string
    accessCode?: string
    reference?: string
    sessionId?: string
    checkoutUrl?: string
    gateway?: PaymentGateway
    currency?: string
  }
}

export interface VerifyPaymentResponse {
  success: boolean
  message?: string
  purchase?: {
    id: string
    userId: string | number
    contentType: ContentType
    contentId: string
    amount: string
    currency: string
    paymentGateway: PaymentGateway
    paymentReference: string
    paymentStatus: string
    createdAt?: string
  }
}

export interface PurchaseRecord {
  id: string
  userId: string | number
  contentType: ContentType
  amount: string
  currency: string
  paymentStatus: string
  createdAt: string
  content?: {
    id: string
    title: string
    thumbnailUrl?: string | null
    type?: string
  }
}

export interface PaymentConfig {
  success: boolean
  supportedCurrencies: string[]
  gatewayMapping: Record<string, PaymentGateway>
  defaultCurrency: string
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const res = await apiClient.get<PaymentConfig>('/api/payments/config')
  return res.data
}

export async function checkAccess(contentType: ContentType, contentId: string): Promise<CheckAccessResponse> {
  const res = await apiClient.get<CheckAccessResponse>(`/api/payments/check-access`, { params: { contentType, contentId } })
  return res.data
}

export async function initializePayment(payload: { 
  contentType: ContentType; 
  contentId: string; 
  currency?: string; 
  callbackUrl?: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  accessType?: string;
  couponCode?: string;
  metadata?: Record<string, unknown>;
  referralCode?: string;
}, idempotencyKey?: string): Promise<InitializePaymentResponse> {
  const headers: Record<string, string> = {}
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }

  // Handle Special Courses separately
  if (payload.contentType === 'special_course') {
    const { contentId, currency, userDetails, accessType, couponCode } = payload; 
    if (!userDetails) {
      throw new Error("User details required for course purchase");
    }

    // Call Special Course Purchase Endpoint
    // POST /api/courses/purchase
    // STRICTLY ALIGNED WITH src/specialcourse.md
    interface SpecialCoursePurchasePayload {
        accessType: 'individual' | 'monthly' | 'yearly';
        currency: string;
        studentName: string;
        studentEmail: string;
        studentPhone: string;
        courseId?: string;
        couponCode?: string;
    }

    // Validate and type-cast accessType
    const validAccessType = (accessType === 'individual' || accessType === 'monthly' || accessType === 'yearly') 
      ? accessType as 'individual' | 'monthly' | 'yearly'
      : 'individual';

    const purchasePayload: SpecialCoursePurchasePayload = {
      accessType: validAccessType,
      currency: currency || 'NGN',
      studentName: userDetails.name,
      studentEmail: userDetails.email,
      studentPhone: userDetails.phone,
      // Optional fields
      ...(couponCode && { couponCode }),
      // courseId only for individual access
      ...((!accessType || accessType === 'individual') && { courseId: contentId })
    };

    console.log('Special Course Purchase Payload:', purchasePayload);

    try {
        const res = await apiClient.post<{ 
            success: boolean; 
            message: string;
            pricing?: {
                currency: string;
                regularPrice: number;
                finalPrice: number;
                discount: number;
                discountPercentage: number;
                couponApplied: boolean;
            }; 
            payment?: { 
                gateway: string; 
                requiredGateway: string; 
                cached: boolean; 
                paymentUrl?: string; 
                reference: string; 
            } 
        }>(`/api/courses/purchase`, purchasePayload, { headers });

        console.log('Purchase Response:', res.data);
        
        // Map response to InitializePaymentResponse format
        let checkoutUrl = res.data.payment?.paymentUrl;

        // Handle Stripe Session ID if URL is missing
        if (!checkoutUrl && res.data.payment?.gateway === 'stripe' && res.data.payment?.reference) {
            checkoutUrl = `https://checkout.stripe.com/pay/${res.data.payment.reference}`;
        }

        if (res.data.success && (checkoutUrl)) {
           return {
             success: true,
             pricing: res.data.pricing,
             data: {
               checkoutUrl: checkoutUrl,
               reference: res.data.payment?.reference,
               // sessionId: res.data.payment?.gateway !== 'paystack' ? res.data.payment?.reference : undefined,
               currency: purchasePayload.currency,
               gateway: res.data.payment?.gateway as PaymentGateway
             }
           };
        } else {
            return {
                success: false,
                message: res.data.message || 'Failed to initialize course purchase',
                data: {}
            }
        }
    } catch (error: unknown) {
        // Handle axios error
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        console.error("Purchase Error Response:", axiosError.response?.data);
        const msg = axiosError.response?.data?.message || axiosError.message || 'Payment initialization failed';
        return {
            success: false,
            message: msg,
            data: {}
        };
    }
  }

  const res = await apiClient.post<InitializePaymentResponse>(`/api/payments/initialize`, payload, { headers })
  return res.data
}

export async function verifyPayment(reference: string, currency: string, idempotencyKey?: string): Promise<VerifyPaymentResponse> {
  const headers: Record<string, string> = {}
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }
  // The spec says GET or POST. Implementation was POST. keeping POST but using currency param.
  // Spec: POST /api/payments/verify/:reference
  // Query Params: currency
  const res = await apiClient.post<VerifyPaymentResponse>(
    `/api/payments/verify/${encodeURIComponent(reference)}`, 
    undefined, 
    { 
      params: { currency },
      headers
    }
  )
  return res.data
}

export async function getMyPurchases(): Promise<{ success: boolean; count?: number; purchases: PurchaseRecord[] }> {
  const res = await apiClient.get<{ success: boolean; count?: number; purchases: PurchaseRecord[] }>(`/api/payments/my-purchases`)
  return res.data
}
