import api from './api/axios';

export const deliveryService = {
  getAvailableOrders: (params) => api.get('/delivery/orders', { params }),
  placeBid: (orderId, data) => api.post(`/delivery/orders/${orderId}/bid`, data),
  deleteBid: (bidId) => api.delete(`/delivery/orders/${bidId}`),
  getMyBids: () => api.get('/delivery/orders/bids'),
  pickupOrder: (orderId) => api.get(`/delivery/orders/${orderId}/pickup`),
  completeOrder: (orderId, otp) => api.patch(`/delivery/orders/${orderId}/complete?otp=${otp}`),

  // TODO: Requires backend aggregation endpoint
  // GET /api/v1/delivery/dashboard/stats
  getDashboardStats: async () => {
    return {
      earningsToday: 450,
      deliveriesCompleted: 12,
      averageDeliveryTime: "8 mins",
      activeBids: 2
    };
  }
};
