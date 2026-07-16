import { apiClient } from '../lib/api';

export const hotelsApi = {
  getHotels: async (params = { limit: 10, offset: 0 }) => {
    const response = await apiClient.get('/consumer/hotels', { params });
    return response.data;
  },
  getHotelById: async (id) => {
    const response = await apiClient.get(`/consumer/hotels/${id}`);
    return response.data;
  }
};
