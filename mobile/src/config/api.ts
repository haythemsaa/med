import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuration de l'API backend
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v4' // Development
  : 'https://your-production-api.com/api/v4'; // Production

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      // Navigation sera gérée par le context
    }
    return Promise.reject(error);
  }
);

export default api;
