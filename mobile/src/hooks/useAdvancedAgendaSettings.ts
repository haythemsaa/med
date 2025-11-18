import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get agenda settings
export const useAgendaSettings = (practitionerId?: string) => {
  return useQuery({
    queryKey: ['agendaSettings', practitionerId],
    queryFn: async () => {
      if (!practitionerId) return null;
      const response = await api.get(`/advanced-agenda-settings/practitioner/${practitionerId}`);
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

// Enable multiple locations
export const useEnableMultipleLocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, locations }: { practitionerId: string; locations: any[] }) => {
      const response = await api.post(`/advanced-agenda-settings/practitioner/${practitionerId}/multiple-locations`, { locations });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendaSettings', variables.practitionerId] });
    },
  });
};

// Enable parallel consultations
export const useEnableParallelConsultations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, maxParallelSlots }: { practitionerId: string; maxParallelSlots: number }) => {
      const response = await api.post(`/advanced-agenda-settings/practitioner/${practitionerId}/parallel-consultations`, { maxParallelSlots });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendaSettings', variables.practitionerId] });
    },
  });
};

// Enable delay notifications
export const useEnableDelayNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, thresholdMinutes }: { practitionerId: string; thresholdMinutes: number }) => {
      const response = await api.post(`/advanced-agenda-settings/practitioner/${practitionerId}/delay-notifications`, { thresholdMinutes });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendaSettings', variables.practitionerId] });
    },
  });
};

// Create or update settings
export const useCreateOrUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/advanced-agenda-settings', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendaSettings', variables.practitionerId] });
    },
  });
};
