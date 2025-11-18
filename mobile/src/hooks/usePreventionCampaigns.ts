import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get cabinet campaigns
export const useCabinetCampaigns = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['campaigns', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return [];
      const response = await api.get(`/prevention-campaigns/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Create campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/prevention-campaigns', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.cabinetId] });
    },
  });
};

// Send campaign
export const useSendCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/prevention-campaigns/${id}/send`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Delete campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/prevention-campaigns/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
