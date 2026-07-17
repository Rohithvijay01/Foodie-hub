import api from './api/axios';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getTerms: () => api.get('/auth/terms'),
  acceptTerms: () => api.post('/auth/accept-terms'),
};
