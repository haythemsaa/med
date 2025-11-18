import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Types
interface ConsultationRecording {
  id: string;
  consultationId: string;
  recordingUrl: string;
  transcription?: string;
  summary?: string;
  medicalLetter?: string;
  status: string;
  createdAt: string;
}

// Get recordings for a consultation
export const useConsultationRecordings = (consultationId?: string) => {
  return useQuery({
    queryKey: ['consultationRecordings', consultationId],
    queryFn: async () => {
      if (!consultationId) return [];
      const response = await api.get(`/consultation-recordings/consultation/${consultationId}`);
      return response.data.data;
    },
    enabled: !!consultationId,
  });
};

// Get recordings for a cabinet
export const useCabinetRecordings = (cabinetId: string) => {
  return useQuery({
    queryKey: ['cabinetRecordings', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Create recording
export const useCreateRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/consultation-recordings', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationRecordings'] });
      queryClient.invalidateQueries({ queryKey: ['cabinetRecordings'] });
    },
  });
};

// Process recording (AI)
export const useProcessRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordingId: string) => {
      const response = await api.post(`/consultation-recordings/${recordingId}/process`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationRecordings'] });
      queryClient.invalidateQueries({ queryKey: ['cabinetRecordings'] });
    },
  });
};

// Get statistics
export const useRecordingStatistics = (cabinetId: string) => {
  return useQuery({
    queryKey: ['recordingStatistics', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/consultation-recordings/cabinet/${cabinetId}/statistics`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Delete recording
export const useDeleteRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordingId: string) => {
      const response = await api.delete(`/consultation-recordings/${recordingId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationRecordings'] });
      queryClient.invalidateQueries({ queryKey: ['cabinetRecordings'] });
    },
  });
};
