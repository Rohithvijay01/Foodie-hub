import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // We will retrieve the token from the Zustand authStore (which uses localStorage persistence)
    // Zustand's getState() allows accessing the store without a React hook context
    try {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // Auth store might not be initialized yet in edge cases
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        try {
            const authStore = useAuthStore.getState();
            if (authStore.isAuthenticated) {
                authStore.logout();
                if (window.location.pathname !== '/login') {
                    // Create a custom event to show toast from a component that has access to it
                    window.dispatchEvent(new CustomEvent('session-expired'));
                    window.location.href = '/login';
                }
            }
        } catch (e) {
            // Ignore
        }
    }
    return Promise.reject(error);
});

export default api;
