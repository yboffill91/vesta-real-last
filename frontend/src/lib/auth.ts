import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchApi } from './api';

export type User = {
  id: number;
  username: string;
  email: string;
  role?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Acciones
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetchApi('/api/auth/token', {
            method: 'POST',
            body: { email, password },
          });
          
          if (response && response.access_token) {
            // Obtener información del usuario
            const userProfile = await fetchApi('/api/users/me', {
              token: response.access_token
            });
            
            set({ 
              token: response.access_token, 
              user: userProfile, 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error durante la autenticación', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, error: null });
      },
      
      setUser: (user: User) => {
        set({ user });
      },
      
      checkAuth: async () => {
        const { token } = get();
        if (!token) return false;
        
        try {
          set({ isLoading: true });
          const userProfile = await fetchApi('/api/users/me', { token });
          set({ user: userProfile, isLoading: false });
          return true;
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          return false;
        }
      }
    }),
    {
      name: 'vestasys-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
