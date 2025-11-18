import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCabinetCampaigns = (cabinetId: string) => {
  return useQuery({
    queryKey: ['prevention-campaigns', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/prevention-campaigns/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCampaignTargetPatients = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-target-patients', campaignId],
    queryFn: async () => {
      const response = await api.get(`/prevention-campaigns/${campaignId}/target-patients`);
      return response.data.data;
    },
    enabled: !!campaignId,
  });
};

export const useCampaignStatistics = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign-statistics', campaignId],
    queryFn: async () => {
      const response = await api.get(`/prevention-campaigns/${campaignId}/statistics`);
      return response.data.data;
    },
    enabled: !!campaignId,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/prevention-campaigns', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention-campaigns'] });
    },
  });
};

export const useScheduleCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/prevention-campaigns/${id}/schedule`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention-campaigns'] });
    },
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/prevention-campaigns/${id}/send`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-statistics'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/prevention-campaigns/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention-campaigns'] });
    },
  });
};
