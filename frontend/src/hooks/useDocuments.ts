import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useDocuments = (params: {
  cabinetId?: string;
  patientId?: string;
  consultationId?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await api.get('/documents', { params });
      return response.data;
    },
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/documents/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/documents/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'document';

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });
};
