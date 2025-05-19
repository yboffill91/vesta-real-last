'use client'

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './auth';

/**
 * Custom hook para manejar el cierre de sesión
 * @returns Un objeto con la función de logout y el estado de carga
 */
export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { logout } = useAuthStore();
  const router = useRouter();

  /**
   * Función que realiza el cierre de sesión
   */
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ejecutar el logout del store
      await logout();
      
      // Redirigir a la página de autenticación
      router.push('/auth');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError(err instanceof Error ? err : new Error('Error al cerrar sesión'));
    } finally {
      setIsLoading(false);
    }
  }, [logout, router]);

  return {
    logout: handleLogout,
    isLoading,
    error,
  };
};