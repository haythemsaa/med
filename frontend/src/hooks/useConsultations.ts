import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useConsultations = (params: {
  cabinetId?: string;
  patientId?: string;
  practitionerId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['consultations', params],
    queryFn: async () => {
      const response = await api.get('/consultations', { params });
      return response.data;
    },
  });
};

export const useConsultation = (id: string) => {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: async () => {
      const response = await api.get(`/consultations/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/consultations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
};

export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/consultations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultation', variables.id] });
    },
  });
};

export const usePatientHistory = (patientId: string) => {
  return useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const response = await api.get(`/consultations/patient/${patientId}/history`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};
