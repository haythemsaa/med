import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDashboardStats = (cabinetId: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/analytics/cabinets/${cabinetId}/dashboard`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useForecastRevenue = (cabinetId: string) => {
  return useQuery({
    queryKey: ['forecast-revenue', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/analytics/cabinets/${cabinetId}/forecast-revenue`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePopularTimes = (cabinetId: string, practitionerId?: string) => {
  return useQuery({
    queryKey: ['popular-times', cabinetId, practitionerId],
    queryFn: async () => {
      const params = practitionerId ? { practitionerId } : {};
      const response = await api.get(`/analytics/cabinets/${cabinetId}/popular-times`, { params });
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePatientEngagement = (cabinetId: string) => {
  return useQuery({
    queryKey: ['patient-engagement', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/analytics/cabinets/${cabinetId}/engagement`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const useChurnRiskPatients = (cabinetId: string) => {
  return useQuery({
    queryKey: ['churn-risk', cabinetId],
    queryFn: async () => {
      const response = await api.get(`/analytics/cabinets/${cabinetId}/churn-risk`);
      return response.data.data;
    },
    enabled: !!cabinetId,
  });
};

export const usePractitionerPerformance = (
  practitionerId: string,
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: ['practitioner-performance', practitionerId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/analytics/practitioners/${practitionerId}/performance`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.data;
    },
    enabled: !!practitionerId,
  });
};
