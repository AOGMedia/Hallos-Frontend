import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface CampaignRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  talent: string;
  jobDescription?: string;
  whatToLearn?: string;
}

export interface CampaignRegisterResponse {
  success: boolean;
  message: string;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  registrationId: string;
}

export const useCampaignRegistration = () => {
  return useMutation({
    mutationFn: async (data: CampaignRegisterPayload) => {
      const response = await apiClient.post<CampaignRegisterResponse>("/api/campaigns/register", data);
      return response.data;
    },
  });
};

export const useVerifyCampaignPayment = (reference: string | null) => {
  return useQuery({
    queryKey: ["verify-campaign", reference],
    queryFn: async () => {
      if (!reference) return null;
      const response = await apiClient.post(`/api/campaigns/verify/${reference}`);
      return response.data;
    },
    enabled: !!reference,
    staleTime: 0,
    retry: 2,
  });
};
