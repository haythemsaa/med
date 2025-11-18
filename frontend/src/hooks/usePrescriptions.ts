import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePrescriptions = (patientId?: string, practitionerId?: string) => {
  return useQuery({
    queryKey: ['prescriptions', patientId, practitionerId],
    queryFn: async () => {
      const url = patientId
        ? `/prescriptions/patient/${patientId}`
        : practitionerId
        ? `/prescriptions/practitioner/${practitionerId}`
        : '/prescriptions';
      const response = await api.get(url);
      return response.data.data;
    },
    enabled: !!(patientId || practitionerId),
  });
};

export const usePrescription = (id: string) => {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: async () => {
      const response = await api.get(`/prescriptions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/prescriptions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useSignPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, signature }: { id: string; signature: string }) => {
      const response = await api.post(`/prescriptions/${id}/sign`, { signature });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', variables.id] });
    },
  });
};

export const useDispensePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pharmacyInfo, itemIds }: { id: string; pharmacyInfo: string; itemIds?: string[] }) => {
      const response = await api.post(`/prescriptions/${id}/dispense`, { pharmacyInfo, itemIds });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', variables.id] });
    },
  });
};

export const useCancelPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/prescriptions/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useSendPrescriptionToDMP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/prescriptions/${id}/dmp`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] });
    },
  });
};

export const usePrescriptionStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['prescription-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/prescriptions/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};
