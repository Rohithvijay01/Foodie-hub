import api from './api/axios';

export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (userId) => api.patch(`/admin/users/${userId}/ban`),

  // TODO: Requires backend aggregation endpoint
  // GET /api/v1/admin/dashboard/stats
  getDashboardStats: async () => {
    return {
      activeStudents: 4521,
      totalOrdersToday: 845,
      activeCanteens: 8,
      systemRevenue: 45000
    };
  }
};
