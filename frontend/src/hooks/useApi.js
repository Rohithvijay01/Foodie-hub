import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { hotelsApi } from '../api/hotels';
import { getHealth } from '../api/health';

// Health Check
export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false
  });
};

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
    }
  });
};

export const useRegister = () => {
  return useMutation({ mutationFn: authApi.register });
};

// Hotels (Restaurants) Hooks
export const useHotels = (params) => {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsApi.getHotels(params),
    // we only want to fetch if the user is authenticated (token exists), but for now we'll just try
    retry: false
  });
};
