import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get patient allergies
export const usePatientAllergies = (patientId?: string) => {
  return useQuery({
    queryKey: ['allergies', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await api.get(`/allergy-details/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

// Create allergy
export const useCreateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/allergy-details', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies', variables.patientId] });
    },
  });
};

// Record allergy test
export const useRecordAllergyTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(`/allergy-details/${id}/test`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });
};

// Delete allergy
export const useDeleteAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/allergy-details/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });
};
