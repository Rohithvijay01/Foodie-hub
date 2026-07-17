import api from './api/axios';

export const canteenService = {
  createCanteen: (data) => api.post('/hotel-manager/hotels/create', data),
  updateStatus: (data) => api.patch('/hotel-manager/hotels/status', data),
  getOrders: (params) => api.get('/hotel-manager/orders', { params }),
  getOrderDetails: (id) => api.get(`/hotel-manager/orders/${id}`),
  getMenuItem: (id) => api.get(`/hotel-manager/menu/${id}`),
  createMenuItem: (data) => api.post('/hotel-manager/menu/create', data),
  updateMenuItem: (id, data) => api.patch(`/hotel-manager/menu/update/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/hotel-manager/menu/delete/${id}`),
  
  // TODO: Requires backend aggregation endpoint
  // GET /api/v1/hotel-manager/dashboard/stats
  getDashboardStats: async () => {
    return {
      revenueToday: 12500,
      ordersToday: 45,
      averagePrepTime: "12 mins",
      topSelling: "Chicken Biryani"
    };
  }
};
