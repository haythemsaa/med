import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useAgendaSettings = (practitionerId: string) => {
  return useQuery({
    queryKey: ['advanced-agenda-settings', practitionerId],
    queryFn: async () => {
      const response = await api.get(`/advanced-agenda-settings/practitioner/${practitionerId}`);
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

export const useCabinetAgendaSettings = (cabinetId: string) => {
  return useQuery({
    queryKey: ['advanced-agenda-settings', 'cabinet', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/advanced-agenda-settings/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCreateOrUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/advanced-agenda-settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings'] });
    },
  });
};

export const useEnableMultipleLocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, locations }: { practitionerId: string; locations: any[] }) => {
      const response = await api.post(`/advanced-agenda-settings/${practitionerId}/multiple-locations`, { locations });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings', variables.practitionerId] });
    },
  });
};

export const useEnableParallelConsultations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, maxParallelSlots }: { practitionerId: string; maxParallelSlots: number }) => {
      const response = await api.post(`/advanced-agenda-settings/${practitionerId}/parallel-consultations`, { maxParallelSlots });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings', variables.practitionerId] });
    },
  });
};

export const useSetSlotTypesByAct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, slotTypesByAct }: { practitionerId: string; slotTypesByAct: any }) => {
      const response = await api.post(`/advanced-agenda-settings/${practitionerId}/slot-types`, { slotTypesByAct });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings', variables.practitionerId] });
    },
  });
};

export const useEnableDelayNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ practitionerId, thresholdMinutes }: { practitionerId: string; thresholdMinutes: number }) => {
      const response = await api.post(`/advanced-agenda-settings/${practitionerId}/delay-notifications`, { thresholdMinutes });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings', variables.practitionerId] });
    },
  });
};

export const useDeleteAgendaSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (practitionerId: string) => {
      const response = await api.delete(`/advanced-agenda-settings/${practitionerId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-agenda-settings'] });
    },
  });
};
