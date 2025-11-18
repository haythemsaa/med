import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useInbox = (userId: string, cabinetId: string) => {
  return useQuery({
    queryKey: ['messages', 'inbox', userId, cabinetId],
    queryFn: async () => {
      const response = await api.get(`/messages/inbox/${userId}`, {
        params: { cabinetId },
      });
      return response.data.data;
    },
    enabled: !!(userId && cabinetId),
  });
};

export const useSentMessages = (userId: string, cabinetId: string) => {
  return useQuery({
    queryKey: ['messages', 'sent', userId, cabinetId],
    queryFn: async () => {
      const response = await api.get(`/messages/sent/${userId}`, {
        params: { cabinetId },
      });
      return response.data.data;
    },
    enabled: !!(userId && cabinetId),
  });
};

export const useThread = (threadId: string) => {
  return useQuery({
    queryKey: ['messages', 'thread', threadId],
    queryFn: async () => {
      const response = await api.get(`/messages/thread/${threadId}`);
      return response.data.data;
    },
    enabled: !!threadId,
  });
};

export const useUnreadCount = (userId: string, cabinetId: string) => {
  return useQuery({
    queryKey: ['messages', 'unread-count', userId, cabinetId],
    queryFn: async () => {
      const response = await api.get(`/messages/unread/${userId}/count`, {
        params: { cabinetId },
      });
      return response.data.data.count;
    },
    enabled: !!(userId && cabinetId),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUrgentMessages = (userId: string, cabinetId: string) => {
  return useQuery({
    queryKey: ['messages', 'urgent', userId, cabinetId],
    queryFn: async () => {
      const response = await api.get(`/messages/urgent/${userId}`, {
        params: { cabinetId },
      });
      return response.data.data;
    },
    enabled: !!(userId && cabinetId),
  });
};

export const useSearchMessages = (userId: string, cabinetId: string, query: string) => {
  return useQuery({
    queryKey: ['messages', 'search', userId, cabinetId, query],
    queryFn: async () => {
      const response = await api.get(`/messages/search/${userId}`, {
        params: { cabinetId, query },
      });
      return response.data.data;
    },
    enabled: !!(userId && cabinetId && query),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/messages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/messages/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useArchiveMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/messages/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/messages/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
