import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get cabinet protocols
export const useCabinetProtocols = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['careProtocols', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return [];
      const response = await api.get(`/care-protocols/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Get protocol statistics
export const useProtocolStatistics = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['protocolStatistics', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return null;
      const response = await api.get(`/care-protocols/cabinet/${cabinetId}/statistics`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Create protocol
export const useCreateProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/care-protocols', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['careProtocols', variables.cabinetId] });
      queryClient.invalidateQueries({ queryKey: ['protocolStatistics'] });
    },
  });
};

// Validate protocol
export const useValidateProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, validatorId }: { id: string; validatorId: string }) => {
      const response = await api.post(`/care-protocols/${id}/validate`, { validatorId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careProtocols'] });
    },
  });
};

// Complete protocol
export const useCompleteProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/care-protocols/${id}/complete`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careProtocols'] });
      queryClient.invalidateQueries({ queryKey: ['protocolStatistics'] });
    },
  });
};

// Suspend protocol
export const useSuspendProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/care-protocols/${id}/suspend`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careProtocols'] });
    },
  });
};

// Delete protocol
export const useDeleteProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/care-protocols/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careProtocols'] });
      queryClient.invalidateQueries({ queryKey: ['protocolStatistics'] });
    },
  });
};
