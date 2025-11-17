import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useAppointments = (filters: any) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    },
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await api.get(`/appointments/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/appointments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
    },
  });
};

export const useAvailableSlots = (practitionerId: string, date: string) => {
  return useQuery({
    queryKey: ['availableSlots', practitionerId, date],
    queryFn: async () => {
      const response = await api.get('/appointments/available-slots', {
        params: { practitionerId, date },
      });
      return response.data.data;
    },
    enabled: !!practitionerId && !!date,
  });
};
