import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useConsultationRecordings = (cabinetId: string, filters?: any) => {
  return useQuery({
    queryKey: ['consultation-recordings', cabinetId, filters],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/cabinet/${cabinetId}`, {
        params: filters,
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useConsultationRecording = (id: string) => {
  return useQuery({
    queryKey: ['consultation-recording', id],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useConsultationRecordingByConsultationId = (consultationId: string) => {
  return useQuery({
    queryKey: ['consultation-recording-by-consultation', consultationId],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/consultation/${consultationId}`);
      return response.data.data;
    },
    enabled: !!consultationId,
  });
};

export const useCreateConsultationRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/consultation-recordings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-recordings'] });
    },
  });
};

export const useStartRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, audioUrl }: { consultationId: string; audioUrl: string }) => {
      const response = await api.post(`/consultation-recordings/${consultationId}/start`, { audioUrl });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-recordings'] });
    },
  });
};

export const useProcessRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/consultation-recordings/${id}/process`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['consultation-recording', id] });
      queryClient.invalidateQueries({ queryKey: ['consultation-recordings'] });
    },
  });
};

export const useDeleteConsultationRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/consultation-recordings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-recordings'] });
    },
  });
};

export const useConsultationRecordingStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['consultation-recording-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};
