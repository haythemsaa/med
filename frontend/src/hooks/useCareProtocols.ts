import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientProtocols = (patientId: string, activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ['care-protocols', 'patient', patientId, activeOnly],
    queryFn: async () => {
      const response = await api.get(`/care-protocols/patient/${patientId}`, {
        params: { activeOnly },
      });
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useCabinetProtocols = (cabinetId: string, status?: string) => {
  return useQuery({
    queryKey: ['care-protocols', 'cabinet', cabinetId, status],
    queryFn: async () => {
      const response = await api.get(`/care-protocols/cabinet/${cabinetId}`, {
        params: { status },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useMeetingProtocols = (meetingId: string) => {
  return useQuery({
    queryKey: ['care-protocols', 'meeting', meetingId],
    queryFn: async () => {
      const response = await api.get(`/care-protocols/meeting/${meetingId}`);
      return response.data.data;
    },
    enabled: !!meetingId,
  });
};

export const useProtocolStatistics = (cabinetId: string) => {
  return useQuery({
    queryKey: ['care-protocol-stats', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/care-protocols/cabinet/${cabinetId}/statistics`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCreateProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/care-protocols', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['care-protocol-stats'] });
    },
  });
};

export const useValidateProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, validatorId }: { id: string; validatorId: string }) => {
      const response = await api.post(`/care-protocols/${id}/validate`, { validatorId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['care-protocol-stats'] });
    },
  });
};

export const useUpdateProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/care-protocols/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
    },
  });
};

export const useCompleteProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/care-protocols/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['care-protocol-stats'] });
    },
  });
};

export const useSuspendProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/care-protocols/${id}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
    },
  });
};

export const useDeleteProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/care-protocols/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['care-protocol-stats'] });
    },
  });
};
