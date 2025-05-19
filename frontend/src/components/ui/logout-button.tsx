'use client'

import { useState, useCallback } from 'react';
import { Button } from "./Buttons"
import { Loader2, LogOut } from "lucide-react"
import { SystemAlert } from "./system-alert"
import { useLogout } from "@/lib/authHelper"

interface LogoutButtonProps {
  /**
   * Clases adicionales para el botón
   */
  className?: string;
  /**
   * Tamaño del botón
   */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /**
   * Variante del botón
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Componente de botón para cerrar sesión que maneja automáticamente
 * el estado de carga y muestra errores si ocurren.
 */
export const LogoutButton = ({
  className,
  size = 'default',
  variant = 'outline',
}: LogoutButtonProps) => {
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const { logout, isLoading, error } = useLogout();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setShowErrorAlert(true);
    }
  }, [logout]);

  return (
    <>
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        size={size}
        variant={variant}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Cerrar sesión
      </Button>

      <SystemAlert
        open={showErrorAlert}
        setOpen={setShowErrorAlert}
        title="Error al cerrar sesión"
        description={
          error?.message || 'Ha ocurrido un error al intentar cerrar la sesión. Por favor, inténtalo de nuevo.'
        }
        confirmText="Aceptar"
        variant="destructive"
      />
    </>
  );
};

