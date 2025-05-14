import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchApi } from './api';
import Cookies from 'js-cookie';

export type User = {
  id: number;
  username: string;
  name: string;
  surname: string;
  role: string;
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
        console.log('[AUTH] Iniciando login:', { email });

        const response = await fetchApi('/api/v1/auth/login', {
          method: 'POST',
          body: { username: email, password },
        });

        console.log('[AUTH] Respuesta login:', response);

        if (response.success && response.data && response.data.access_token) {
          // Guardar el token en cookie para el middleware
          Cookies.set('auth_token', response.data.access_token, { path: '/' });
          set({
            token: response.data.access_token,
            user: response.data.user,
            isLoading: false,
            error: null,
          });
          console.log('[AUTH] Login exitoso, usuario establecido:', response.data.user);
        } else {
          set({
            error: response.error || 'Error durante la autenticación',
            isLoading: false,
          });
          throw new Error(response.error || 'Error durante la autenticación');
        }
      },
      
      logout: () => {
        // Eliminar la cookie del token
        Cookies.remove('auth_token', { path: '/' });
        set({ user: null, token: null, error: null });
      },
      
      setUser: (user: User) => {
        set({ user });
      },
      
      checkAuth: async () => {
        const { token, user } = get();
        
        // Si ya tenemos token y usuario, consideramos que ya estamos autenticados
        if (token && user) {
          console.log('[AUTH] Sesión válida encontrada:', { userId: user.id });
          return true;
        }
        
        // Si solo tenemos token pero no usuario, probablemente la sesión no es válida
        if (token && !user) {
          console.log('[AUTH] Token encontrado pero sin datos de usuario');
          set({ token: null, isLoading: false });
          return false;
        }
        
        // Si no tenemos token, claramente no estamos autenticados
        console.log('[AUTH] No hay sesión activa');
        return false;
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
