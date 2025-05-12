"use client";

import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { user, token, checkAuth, isLoading } = useAuthStore();
  
  const isAuthenticated = !!user && !!token;

  // Verificar la autenticación al cargar
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Error verificando autenticación:", error);
        }
      }
    };

    verifyAuth();
  }, [checkAuth, token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
