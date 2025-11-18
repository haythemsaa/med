import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePatientPayments = (patientId: string) => {
  return useQuery({
    queryKey: ['payments', 'patient', patientId],
    queryFn: async () => {
      const response = await api.get(`/payments/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
  });
};

export const useCabinetPayments = (cabinetId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['payments', 'cabinet', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/payments/cabinet/${cabinetId}`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePaymentStatistics = (cabinetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['payment-stats', cabinetId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/payments/cabinet/${cabinetId}/statistics`, {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!(cabinetId && startDate && endDate),
  });
};

export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/payments/intent', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stripeChargeId }: { id: string; stripeChargeId?: string }) => {
      const response = await api.put(`/payments/${id}/confirm`, { stripeChargeId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useProcessCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/payments/cash', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount, reason }: { id: string; amount: number; reason: string }) => {
      const response = await api.post(`/payments/${id}/refund`, { amount, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useGenerateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/payments/${id}/receipt`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
