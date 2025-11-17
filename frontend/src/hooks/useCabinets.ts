import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCabinets = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['cabinets', page, limit],
    queryFn: async () => {
      const response = await api.get('/cabinets', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

export const useCabinet = (id: string) => {
  return useQuery({
    queryKey: ['cabinet', id],
    queryFn: async () => {
      const response = await api.get(`/cabinets/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCabinet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/cabinets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinets'] });
    },
  });
};

export const useUpdateCabinet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/cabinets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cabinets'] });
      queryClient.invalidateQueries({ queryKey: ['cabinet', variables.id] });
    },
  });
};

export const useCabinetStats = (id: string) => {
  return useQuery({
    queryKey: ['cabinet-stats', id],
    queryFn: async () => {
      const response = await api.get(`/cabinets/${id}/stats`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCabinetRooms = (cabinetId: string) => {
  return useQuery({
    queryKey: ['cabinet-rooms', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/cabinets/${cabinetId}/rooms`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cabinetId, data }: { cabinetId: string; data: any }) => {
      const response = await api.post(`/cabinets/${cabinetId}/rooms`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cabinet-rooms', variables.cabinetId] });
    },
  });
};
