import { apiClient } from '../lib/api';

export const getHealth = async () => {
  const response = await apiClient.get('/health', { baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' });
  return response.data;
};
