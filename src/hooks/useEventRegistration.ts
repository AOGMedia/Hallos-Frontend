import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { EventRegisterPayload } from "@/components/event/types";

// registers a user or guest
export const useRegistration = () => {
  return useMutation({
    mutationFn: async (data: EventRegisterPayload) => {
      const response = await apiClient.post("/event/register", data);
      return response.data;
    },
  });
};
// Fetch all registrations (for admin or dashboard view)
export const useFetchRegistrations = () => {
  return useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const response = await apiClient.get("/event/registrations");
      return response.data.registrations;
    },

    staleTime: 1000 * 60, // 1 minute cache
    retry: 1, // retry once on failure
  });
};
