import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCabinetMeetings = (cabinetId: string, filters?: any) => {
  return useQuery({
    queryKey: ['msp-meetings', cabinetId, filters],
    queryFn: async () => {
      const response = await api.get(`/msp-meetings/cabinet/${cabinetId}`, {
        params: filters,
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useUserMeetings = (userId: string) => {
  return useQuery({
    queryKey: ['msp-meetings', 'user', userId],
    queryFn: async () => {
      const response = await api.get(`/msp-meetings/user/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
};

export const useMeeting = (id: string) => {
  return useQuery({
    queryKey: ['msp-meeting', id],
    queryFn: async () => {
      const response = await api.get(`/msp-meetings/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useSuggestParticipants = (cabinetId: string, meetingType: string) => {
  return useQuery({
    queryKey: ['msp-meeting-participants-suggestions', cabinetId, meetingType],
    queryFn: async () => {
      const response = await api.get(`/msp-meetings/cabinet/${cabinetId}/suggest-participants`, {
        params: { meetingType },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && meetingType),
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/msp-meetings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['msp-meetings'] });
    },
  });
};

export const useAddParticipants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, participants }: { id: string; participants: any[] }) => {
      const response = await api.post(`/msp-meetings/${id}/participants`, { participants });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['msp-meeting', variables.id] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ participantId, attendance }: { participantId: string; attendance: string }) => {
      const response = await api.put(`/msp-meetings/participant/${participantId}/attendance`, { attendance });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['msp-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['msp-meeting'] });
    },
  });
};

export const useStartMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/msp-meetings/${id}/start`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['msp-meeting', id] });
      queryClient.invalidateQueries({ queryKey: ['msp-meetings'] });
    },
  });
};

export const useCompleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.post(`/msp-meetings/${id}/complete`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['msp-meeting', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['msp-meetings'] });
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/msp-meetings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['msp-meetings'] });
    },
  });
};
