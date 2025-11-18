import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get cabinet contacts
export const useCabinetContacts = (cabinetId?: string) => {
  return useQuery({
    queryKey: ['professionalContacts', cabinetId],
    queryFn: async () => {
      if (!cabinetId) return [];
      const response = await api.get(`/professional-contacts/cabinet/${cabinetId}`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

// Create contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/professional-contacts', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['professionalContacts', variables.cabinetId] });
    },
  });
};

// Share contact
export const useShareContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/professional-contacts/${id}/share`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalContacts'] });
    },
  });
};

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/professional-contacts/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionalContacts'] });
    },
  });
};
