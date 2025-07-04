import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Menu } from "@/models/menu";

// Interfaces para la respuesta del servidor
interface ServerResponse<T> {
  status: string;
  message: string;
  data: T;
}

export function useMenu() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Menu | null>(null);

  const fetchMenu = useCallback(async (menuId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      // Usar el endpoint correcto según la documentación
      const response = await fetchApi<ServerResponse<Menu>>(`/api/v1/menus/${menuId}`);
      
      if (response.success && response.data) {
        const menuData = response.data.data;
        setData(menuData);
        return menuData;
      }
      
      setError(response.error || `Error al obtener el menú con ID ${menuId}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al obtener el menú con ID ${menuId}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchMenu, loading, error, data };
}
