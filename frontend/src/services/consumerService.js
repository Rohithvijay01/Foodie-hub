import api from './api/axios';

export const consumerService = {
  getProfile: () => api.get('/consumer/profile'),
  updateProfile: (data) => api.patch('/consumer/profile', data),
  getHotels: (params) => api.get('/consumer/hotels', { params }),
  getHotelDetails: (id) => api.get(`/consumer/hotels/${id}`),
  placeOrder: (data) => api.post('/consumer/orders', data),
  getOrderHistory: () => api.get('/consumer/orders/history'),
  getOrderDetails: (id) => api.get(`/consumer/orders/${id}`),
  getOrderBids: (id) => api.get(`/consumer/orders/${id}/bids`),
  acceptBid: (orderId, bidId) => api.post(`/consumer/orders/${orderId}/accept-bid/${bidId}`),
  cancelOrder: (id) => api.post(`/consumer/orders/${id}/cancel`),
};
