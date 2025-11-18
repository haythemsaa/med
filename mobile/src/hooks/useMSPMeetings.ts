import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get cabinet meetings
export const useCabinetMeetings = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['mspMeetings', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return [];
      const response = await api.get(`/msp-meetings/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Create meeting
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/msp-meetings', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mspMeetings', variables.cabinetId] });
    },
  });
};

// Start meeting
export const useStartMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/msp-meetings/${id}/start`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspMeetings'] });
    },
  });
};

// Complete meeting
export const useCompleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(`/msp-meetings/${id}/complete`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspMeetings'] });
    },
  });
};

// Delete meeting
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/msp-meetings/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mspMeetings'] });
    },
  });
};
