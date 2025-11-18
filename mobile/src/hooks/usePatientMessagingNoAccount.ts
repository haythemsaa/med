import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get messages for cabinet
export const useMessagesNoAccount = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['patientMessagesNoAccount', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return [];
      const response = await api.get(`/patient-messaging-no-account/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Send message to patient without account
export const useSendMessageNoAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/patient-messaging-no-account/send', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patientMessagesNoAccount', variables.cabinetId] });
    },
  });
};

// Get message by access token (for patient)
export const useMessageByToken = (token?: string) => {
  return useQuery({
    queryKey: ['patientMessageByToken', token],
    queryFn: async () => {
      if (!token) return null;
      const response = await api.get(`/patient-messaging-no-account/message/${token}`);
      return response.data.data;
    },
    enabled: !!token,
  });
};
