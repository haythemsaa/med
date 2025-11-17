import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatients = (cabinetId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['patients', cabinetId, page, limit],
    queryFn: async () => {
      const response = await api.get('/patients', {
        params: { cabinetId, page, limit },
      });
      return response.data;
    },
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/patients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
    },
  });
};
