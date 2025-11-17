import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTeleconsultationSession = (appointmentId: string) => {
  return useQuery({
    queryKey: ['teleconsultation', appointmentId],
    queryFn: async () => {
      const response = await api.get(`/teleconsultations/appointments/${appointmentId}`);
      return response.data.data;
    },
    enabled: !!appointmentId,
  });
};

export const useCreateTeleconsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.post('/teleconsultations/sessions', { appointmentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teleconsultation'] });
    },
  });
};

export const useJoinSession = () => {
  return useMutation({
    mutationFn: async (data: { sessionId: string; userType: 'patient' | 'practitioner' }) => {
      const response = await api.post('/teleconsultations/sessions/join', data);
      return response.data;
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post('/teleconsultations/sessions/end', { sessionId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teleconsultation'] });
    },
  });
};

export const useTeleconsultationStats = (
  cabinetId: string,
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: ['teleconsultation-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/teleconsultations/cabinets/${cabinetId}/stats`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};
