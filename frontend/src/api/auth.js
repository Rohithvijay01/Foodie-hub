import { apiClient } from '../lib/api';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  getTerms: async () => {
    const response = await apiClient.get('/auth/terms');
    return response.data;
  },
  acceptTerms: async () => {
    const response = await apiClient.post('/auth/accept-terms');
    return response.data;
  },
};
