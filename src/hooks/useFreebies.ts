import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freebiesService } from '@/services/freebiesService';
import { FreebieTab } from '@/types/freebie';

export const freebieKeys = {
  all: ['freebies'] as const,
  lists: () => [...freebieKeys.all, 'list'] as const,
  list: (tab: FreebieTab, page: number) => [...freebieKeys.lists(), { tab, page }] as const,
  details: () => [...freebieKeys.all, 'detail'] as const,
  detail: (id: string) => [...freebieKeys.details(), id] as const,
};

/**
 * Hook for fetching the freebies list (lightweight)
 */
export function useFreebiesList(tab: FreebieTab, page: number = 1) {
  return useQuery({
    queryKey: freebieKeys.list(tab, page),
    queryFn: async () => {
      const data = tab === 'mine' 
        ? await freebiesService.myFreebies(page)
        : await freebiesService.getFreebies(page);
      
      if (!data.success) throw new Error(data.error || 'Failed to fetch freebies');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a single freebie's detailed data
 */
export function useFreebieDetail(id: string | null) {
  return useQuery({
    queryKey: freebieKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const data = await freebiesService.getFreebieDetail(id);
      if (!data.success) throw new Error(data.error || 'Failed to fetch detail');
      return data.freebie;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Mutations
 */
export function useUpdateFreebiePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, price, currency }: { id: string; price: number; currency: string }) => 
      freebiesService.updatePrice(id, price, currency),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: freebieKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
    },
  });
}

export function useDeleteFreebie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => freebiesService.deleteFreebie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: freebieKeys.lists() });
    },
  });
}

export function usePurchaseFreebie() {
  return useMutation({
    mutationFn: ({ id, currency }: { id: string; currency: string }) => 
      freebiesService.initiatePurchase(id, currency),
  });
}
