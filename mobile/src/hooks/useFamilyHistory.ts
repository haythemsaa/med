import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get patient family history
export const usePatientFamilyHistory = (patientId?: string) => {
  return useQuery({
    queryKey: ['familyHistory', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await api.get(`/family-history/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

// Create family history entry
export const useCreateFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/family-history', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory', variables.patientId] });
    },
  });
};

// Delete family history
export const useDeleteFamilyHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/family-history/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyHistory'] });
    },
  });
};
