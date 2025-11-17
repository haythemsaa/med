import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePractitioners = (cabinetId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['practitioners', cabinetId, page, limit],
    queryFn: async () => {
      const response = await api.get('/practitioners', {
        params: { cabinetId, page, limit },
      });
      return response.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePractitioner = (id: string) => {
  return useQuery({
    queryKey: ['practitioner', id],
    queryFn: async () => {
      const response = await api.get(`/practitioners/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePractitioner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/practitioners', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    },
  });
};

export const useUpdatePractitioner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/practitioners/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner', variables.id] });
    },
  });
};

export const usePractitionerSchedules = (practitionerId: string) => {
  return useQuery({
    queryKey: ['practitioner-schedules', practitionerId],
    queryFn: async () => {
      const response = await api.get(`/practitioners/${practitionerId}/schedules`);
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, data }: { practitionerId: string; data: any }) => {
      const response = await api.post(`/practitioners/${practitionerId}/schedules`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['practitioner-schedules', variables.practitionerId] });
    },
  });
};

export const usePractitionerAbsences = (practitionerId: string) => {
  return useQuery({
    queryKey: ['practitioner-absences', practitionerId],
    queryFn: async () => {
      const response = await api.get(`/practitioners/${practitionerId}/absences`);
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

export const useCreateAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, data }: { practitionerId: string; data: any }) => {
      const response = await api.post(`/practitioners/${practitionerId}/absences`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['practitioner-absences', variables.practitionerId] });
    },
  });
};
