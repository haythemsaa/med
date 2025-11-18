import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCabinetReviews = (cabinetId: string, publicOnly: boolean = true) => {
  return useQuery({
    queryKey: ['reviews', 'cabinet', cabinetId, publicOnly],
    queryFn: async () => {
      const response = await api.get(`/reviews/cabinet/${cabinetId}`, {
        params: { publicOnly },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePractitionerReviews = (practitionerId: string, publicOnly: boolean = true) => {
  return useQuery({
    queryKey: ['reviews', 'practitioner', practitionerId, publicOnly],
    queryFn: async () => {
      const response = await api.get(`/reviews/practitioner/${practitionerId}`, {
        params: { publicOnly },
      });
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

export const useCabinetRatings = (cabinetId: string) => {
  return useQuery({
    queryKey: ['ratings', 'cabinet', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/reviews/cabinet/${cabinetId}/ratings`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePractitionerRating = (practitionerId: string) => {
  return useQuery({
    queryKey: ['rating', 'practitioner', practitionerId],
    queryFn: async () => {
      const response = await api.get(`/reviews/practitioner/${practitionerId}/rating`);
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};

export const usePendingReviews = (cabinetId: string) => {
  return useQuery({
    queryKey: ['reviews', 'pending', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/reviews/cabinet/${cabinetId}/pending`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/reviews', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isApproved, moderatedBy }: { id: string; isApproved: boolean; moderatedBy: string }) => {
      const response = await api.put(`/reviews/${id}/moderate`, { isApproved, moderatedBy });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useRespondToReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const response_data = await api.put(`/reviews/${id}/respond`, { response });
      return response_data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
