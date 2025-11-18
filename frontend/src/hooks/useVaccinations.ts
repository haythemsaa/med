import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientVaccinations = (patientId: string) => {
  return useQuery({
    queryKey: ['vaccinations', 'patient', patientId],
    queryFn: async () => {
      const response = await api.get(`/vaccinations/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useUpcomingVaccinations = (cabinetId: string) => {
  return useQuery({
    queryKey: ['vaccinations', 'upcoming', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/vaccinations/cabinet/${cabinetId}/upcoming`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useVaccinationCoverage = (patientId: string) => {
  return useQuery({
    queryKey: ['vaccinations', 'coverage', patientId],
    queryFn: async () => {
      const response = await api.get(`/vaccinations/patient/${patientId}/coverage`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useVaccinationStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['vaccination-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/vaccinations/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};

export const useCreateVaccination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/vaccinations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });
};

export const useUpdateVaccination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/vaccinations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });
};

export const useRecordNextDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(`/vaccinations/${id}/next-dose`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });
};

export const useSendVaccinationToDMP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/vaccinations/${id}/dmp`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });
};

export const useDeleteVaccination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vaccinations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });
};
