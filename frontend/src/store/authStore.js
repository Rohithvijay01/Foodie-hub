import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null, // Will store Registration Number, Department, Role, etc.
            isAuthenticated: false,
            
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
            
            updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
        }),
        {
            name: 'auth-storage', // name of item in the storage (must be unique)
        }
    )
);
