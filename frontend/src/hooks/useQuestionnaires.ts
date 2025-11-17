import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useQuestionnaires = (cabinetId: string, activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ['questionnaires', cabinetId, activeOnly],
    queryFn: async () => {
      const response = await api.get(`/questionnaires/cabinets/${cabinetId}`, {
        params: { activeOnly },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useQuestionnaire = (id: string) => {
  return useQuery({
    queryKey: ['questionnaire', id],
    queryFn: async () => {
      const response = await api.get(`/questionnaires/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/questionnaires', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
  });
};

export const useUpdateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/questionnaires/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaire', variables.id] });
    },
  });
};

export const useDeleteQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/questionnaires/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaires'] });
    },
  });
};

export const useSubmitQuestionnaireResponse = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/questionnaires/responses', data);
      return response.data;
    },
  });
};

export const useQuestionnaireStatistics = (id: string) => {
  return useQuery({
    queryKey: ['questionnaire-stats', id],
    queryFn: async () => {
      const response = await api.get(`/questionnaires/${id}/statistics`);
      return response.data.data;
    },
    enabled: !!id,
  });
};
