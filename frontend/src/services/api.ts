import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Services
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const cabinetAPI = {
  getAll: (params?: any) => api.get('/cabinets', { params }),
  getById: (id: string) => api.get(`/cabinets/${id}`),
  create: (data: any) => api.post('/cabinets', data),
  update: (id: string, data: any) => api.put(`/cabinets/${id}`, data),
  delete: (id: string) => api.delete(`/cabinets/${id}`),
  getStats: (id: string) => api.get(`/cabinets/${id}/stats`),
};

export const patientAPI = {
  getAll: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  getHistory: (id: string) => api.get(`/patients/${id}/history`),
  getStats: (id: string) => api.get(`/patients/${id}/stats`),
};

export const practitionerAPI = {
  getAll: (params?: any) => api.get('/practitioners', { params }),
  getById: (id: string) => api.get(`/practitioners/${id}`),
  create: (data: any) => api.post('/practitioners', data),
  update: (id: string, data: any) => api.put(`/practitioners/${id}`, data),
  delete: (id: string) => api.delete(`/practitioners/${id}`),
  getSchedule: (id: string) => api.get(`/practitioners/${id}/schedule`),
  setSchedule: (id: string, data: any) => api.put(`/practitioners/${id}/schedule`, data),
  addAbsence: (id: string, data: any) => api.post(`/practitioners/${id}/absences`, data),
  getStats: (id: string) => api.get(`/practitioners/${id}/stats`),
};

export const appointmentAPI = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  cancel: (id: string, reason?: string) => api.put(`/appointments/${id}/cancel`, { reason }),
  markAsNoShow: (id: string) => api.put(`/appointments/${id}/no-show`),
  getAvailableSlots: (practitionerId: string, date: string, duration?: number) =>
    api.get('/appointments/available-slots', { params: { practitionerId, date, duration } }),
};

export const consultationAPI = {
  getAll: (params?: any) => api.get('/consultations', { params }),
  getById: (id: string) => api.get(`/consultations/${id}`),
  create: (data: any) => api.post('/consultations', data),
  update: (id: string, data: any) => api.put(`/consultations/${id}`, data),
  delete: (id: string) => api.delete(`/consultations/${id}`),
  getByAppointment: (appointmentId: string) =>
    api.get(`/consultations/appointment/${appointmentId}`),
  getPatientHistory: (patientId: string) =>
    api.get(`/consultations/patient/${patientId}/history`),
};

export const documentAPI = {
  getAll: (params?: any) => api.get('/documents', { params }),
  getById: (id: string) => api.get(`/documents/${id}`),
  upload: (data: FormData) => api.post('/documents/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};
