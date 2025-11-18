import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientFamilyHistory = (patientId: string) => {
  return useQuery({
    queryKey: ['family-history', 'patient', patientId],
    queryFn: async () => {
      const response = await api.get(`/family-history/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useFamilyHistoryByCondition = (patientId: string, condition: string) => {
  return useQuery({
    queryKey: ['family-history', 'patient', patientId, 'condition', condition],
    queryFn: async () => {
      const response = await api.get(`/family-history/patient/${patientId}/condition`, {
        params: { condition },
      });
      return response.data.data;
    },
    enabled: !!(patientId && condition),
  });
};

export const useFamilyTreeSummary = (patientId: string) => {
  return useQuery({
    queryKey: ['family-tree-summary', patientId],
    queryFn: async () => {
      const response = await api.get(`/family-history/patient/${patientId}/summary`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useCreateFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/family-history', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-history'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree-summary'] });
    },
  });
};

export const useUpdateFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/family-history/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-history'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree-summary'] });
    },
  });
};

export const useDeleteFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/family-history/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-history'] });
      queryClient.invalidateQueries({ queryKey: ['family-tree-summary'] });
    },
  });
};
