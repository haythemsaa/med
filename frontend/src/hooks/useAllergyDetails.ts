import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientAllergies = (patientId: string, activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ['allergy-details', 'patient', patientId, activeOnly],
    queryFn: async () => {
      const response = await api.get(`/allergy-details/patient/${patientId}`, {
        params: { activeOnly },
      });
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useAllergiesByType = (patientId: string, type: string) => {
  return useQuery({
    queryKey: ['allergy-details', 'patient', patientId, 'type', type],
    queryFn: async () => {
      const response = await api.get(`/allergy-details/patient/${patientId}/type`, {
        params: { type },
      });
      return response.data.data;
    },
    enabled: !!(patientId && type),
  });
};

export const useAllergySummary = (patientId: string) => {
  return useQuery({
    queryKey: ['allergy-summary', patientId],
    queryFn: async () => {
      const response = await api.get(`/allergy-details/patient/${patientId}/summary`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useCreateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/allergy-details', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergy-details'] });
      queryClient.invalidateQueries({ queryKey: ['allergy-summary'] });
    },
  });
};

export const useUpdateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/allergy-details/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergy-details'] });
      queryClient.invalidateQueries({ queryKey: ['allergy-summary'] });
    },
  });
};

export const useUpdateAllergyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/allergy-details/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergy-details'] });
      queryClient.invalidateQueries({ queryKey: ['allergy-summary'] });
    },
  });
};

export const useRecordAllergyTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, testData }: { id: string; testData: any }) => {
      const response = await api.post(`/allergy-details/${id}/test`, testData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergy-details'] });
    },
  });
};

export const useDeleteAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/allergy-details/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergy-details'] });
      queryClient.invalidateQueries({ queryKey: ['allergy-summary'] });
    },
  });
};
