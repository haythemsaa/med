import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useMessageByToken = (token: string) => {
  return useQuery({
    queryKey: ['patient-message-no-account', token],
    queryFn: async () => {
      const response = await api.get(`/patient-messaging-no-account/message/${token}`);
      return response.data.data;
    },
    enabled: !!token,
  });
};

export const useNoAccountMessagingStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['patient-messaging-no-account-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/patient-messaging-no-account/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};

export const useSendNoAccountMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/patient-messaging-no-account/send', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-messaging-no-account-stats'] });
    },
  });
};

export const useMarkMessageAsRead = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/patient-messaging-no-account/message/${token}/read`);
      return response.data;
    },
  });
};
