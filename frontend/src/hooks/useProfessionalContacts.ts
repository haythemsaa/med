import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCabinetContacts = (cabinetId: string, userId?: string, filters?: any) => {
  return useQuery({
    queryKey: ['professional-contacts', cabinetId, userId, filters],
    queryFn: async () => {
      const response = await api.get(`/professional-contacts/cabinet/${cabinetId}`, {
        params: { userId, ...filters },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useContactsByType = (cabinetId: string, type: string) => {
  return useQuery({
    queryKey: ['professional-contacts', cabinetId, 'type', type],
    queryFn: async () => {
      const response = await api.get(`/professional-contacts/cabinet/${cabinetId}/type`, {
        params: { type },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && type),
  });
};

export const useContactStatistics = (cabinetId: string) => {
  return useQuery({
    queryKey: ['professional-contact-stats', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/professional-contacts/cabinet/${cabinetId}/statistics`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/professional-contacts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['professional-contact-stats'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/professional-contacts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
    },
  });
};

export const useShareContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userIds }: { id: string; userIds: string[] }) => {
      const response = await api.post(`/professional-contacts/${id}/share`, { userIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/professional-contacts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['professional-contact-stats'] });
    },
  });
};
