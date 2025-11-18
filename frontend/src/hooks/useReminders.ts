import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientReminders = (patientId: string) => {
  return useQuery({
    queryKey: ['reminders', 'patient', patientId],
    queryFn: async () => {
      const response = await api.get(`/reminders/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useReminderStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['reminder-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/reminders/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/reminders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

export const useCreateAppointmentReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.post(`/reminders/appointment/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

export const useCancelAppointmentReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await api.delete(`/reminders/appointment/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

export const useProcessReminders = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/reminders/process');
      return response.data;
    },
  });
};
