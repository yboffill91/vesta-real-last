import { useState, useCallback } from 'react';
import { fetchApi, getAuthToken } from '@/lib/api';
import { 
  Menu, 
  MenuItem, 
  MenuSalesArea, 
  CreateMenuRequest, 
  UpdateMenuRequest, 
  AddMenuItemRequest,
  AssignToAreaRequest,
  MenuStatus
} from '@/models/menu';

interface UseMenusReturn {
  menus: Menu[];
  loading: boolean;
  error: string | null;
  fetchMenus: (date?: string) => Promise<Menu[]>;
  getMenuById: (id: number) => Promise<Menu | null>;
  createMenu: (data: CreateMenuRequest) => Promise<Menu | null>;
  updateMenu: (id: number, data: UpdateMenuRequest) => Promise<Menu | null>;
  deleteMenu: (id: number) => Promise<boolean>;
  addMenuItem: (menuId: number, data: AddMenuItemRequest) => Promise<MenuItem | null>;
  removeMenuItem: (menuId: number, itemId: number) => Promise<boolean>;
  updateMenuItem: (menuId: number, itemId: number, data: Partial<AddMenuItemRequest>) => Promise<boolean>;
  assignToArea: (menuId: number, data: AssignToAreaRequest) => Promise<boolean>;
  publishMenu: (id: number) => Promise<boolean>;
  archiveMenu: (id: number) => Promise<boolean>;
  getMenuWithItems: (id: number) => Promise<(Menu & { items?: MenuItem[] }) | null>;
}

// Interfaces para las respuestas API para garantizar tipos seguros
// La estructura de respuesta del servidor
interface ServerResponse<T> {
  status: string;
  message: string;
  data: T;
}

// La estructura que devuelve fetchApi<ServerResponse<T>>
interface ApiResponse<T> {
  success: boolean;
  data?: ServerResponse<T>;
  error?: string;
  status?: number;
}

// Tipos específicos para las respuestas de menús
type ApiMenuListResponse = ApiResponse<Menu[]>;
type ApiMenuSingleResponse = ApiResponse<Menu>;
type ApiMenuItemResponse = ApiResponse<MenuItem>;

/**
 * Hook personalizado para gestionar operaciones CRUD de menús
 */
export function useMenus(): UseMenusReturn {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Obtiene todos los menús con filtro opcional por fecha
   */
  const fetchMenus = useCallback(async (date?: string, showAllMenus: boolean = true): Promise<Menu[]> => {
    setLoading(true);
    setError(null);
    try {
      // Construir URL con filtros opcionales
      let url = '/api/v1/menus';
      const params = new URLSearchParams();
      
      if (date) {
        params.append('date', date);
      }
      
      if (showAllMenus) {
        params.append('active_only', 'false');
      }
      
      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
      const response = await fetchApi<ServerResponse<Menu[]>>(url);
      
      if (response.success && response.data) {
        const menuList = response.data.data || [];
        setMenus(menuList);
        return menuList;
      } 
      
      setError(response.error || 'Error al obtener los menús');
      return [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al obtener los menús';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un menú específico por su ID
   */
  const getMenuById = useCallback(async (id: number): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ServerResponse<Menu>>(`/api/v1/menus/${id}`);

      if (response.success && response.data) {
        return response.data.data;
      }

      setError(response.error || `Error al obtener el menú con ID ${id}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al obtener el menú con ID ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un menú con sus productos asignados
   */
  const getMenuWithItems = useCallback(async (id: number): Promise<(Menu & { items?: MenuItem[] }) | null> => {
    setLoading(true);
    setError(null);
    try {
      // Usamos directamente el endpoint de detalle, que ya incluye los items
      const response = await fetchApi<ServerResponse<Menu>>(`/api/v1/menus/${id}`);

      if (response.success && response.data) {
        return response.data.data;
      }

      setError(response.error || `Error al obtener el menú con sus productos con ID ${id}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al obtener el menú con sus productos con ID ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo menú
   */
  const createMenu = useCallback(async (data: CreateMenuRequest): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken(); // Asegurarse de usar el token actualizado
      
      // Asegurarse de que description siempre tiene un valor (aunque sea null)
      // Este es el workaround mientras se arregla el backend
      const dataToSend = {
        ...data,
        description: data.description || null
      };
      
      console.log('Enviando datos al API:', dataToSend);
      
      const response = await fetchApi<ServerResponse<Menu>>('/api/v1/menus', {
        method: 'POST',
        body: dataToSend,
        token: freshToken,
      });

      if (response.success && response.data) {
        const newMenu = response.data.data;
        // Actualizar la lista de menús
        setMenus(prevMenus => [...prevMenus, newMenu]);
        return newMenu;
      }

      // Mostrar detalles del error para debug
      console.error('Error en respuesta API:', response);
      setError(response.error || 'Error al crear el menú');
      return null;
    } catch (err: any) {
      // Mejorar información de error para debugging
      console.error('Error al crear menú:', err);
      const errorMessage = err?.message || 'Error al crear el menú';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un menú existente
   */
  const updateMenu = useCallback(async (id: number, data: UpdateMenuRequest): Promise<Menu | null> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi<ServerResponse<Menu>>(`/api/v1/menus/${id}`, {
        method: 'PUT',
        body: data,
        token: freshToken,
      });

      if (response.success && response.data) {
        const updatedMenu = response.data.data;
        // Actualizar el menú en la lista local
        setMenus(prevMenus => 
          prevMenus.map(menu => 
            menu.id === id ? updatedMenu : menu
          )
        );
        return updatedMenu;
      }

      setError(response.error || `Error al actualizar el menú con ID ${id}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al actualizar el menú con ID ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un menú
   */
  const deleteMenu = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi(`/api/v1/menus/${id}`, {
        method: 'DELETE',
        token: freshToken,
      });

      if (response.success) {
        // Eliminar el menú de la lista local
        setMenus(prevMenus => prevMenus.filter(menu => menu.id !== id));
        return true;
      }

      setError(response.error || `Error al eliminar el menú con ID ${id}`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al eliminar el menú con ID ${id}`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Añade un producto al menú
   */
  const addMenuItem = useCallback(async (menuId: number, data: AddMenuItemRequest): Promise<MenuItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi<ServerResponse<MenuItem>>(`/api/v1/menus/${menuId}/items`, {
        method: 'POST',
        body: data,
        token: freshToken,
      });

      if (response.success && response.data) {
        return response.data.data;
      }

      setError(response.error || `Error al añadir producto al menú con ID ${menuId}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al añadir producto al menú con ID ${menuId}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un producto del menú
   */
  const removeMenuItem = useCallback(async (menuId: number, itemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi(`/api/v1/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE',
        token: freshToken,
      });

      if (response.success) {
        return true;
      }

      setError(response.error || `Error al eliminar el producto del menú`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al eliminar el producto del menú`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un producto del menú
   */
  const updateMenuItem = useCallback(async (menuId: number, itemId: number, data: Partial<AddMenuItemRequest>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi(`/api/v1/menus/${menuId}/items/${itemId}`, {
        method: 'PUT',
        body: data,
        token: freshToken,
      });

      if (response.success) {
        return true;
      }

      setError(response.error || `Error al actualizar el producto del menú`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al actualizar el producto del menú`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asigna un menú a un área de ventas
   */
  const assignToArea = useCallback(async (menuId: number, data: AssignToAreaRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      // Usando el endpoint correcto /assign
      const response = await fetchApi(`/api/v1/menus/${menuId}/assign`, {
        method: 'POST',
        body: data,
        token: freshToken,
      });

      if (response.success) {
        return true;
      }

      setError(response.error || `Error al asignar el menú al área de ventas`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al asignar el menú al área de ventas`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Publica un menú (cambia su estado a 'publicada')
   */
  const publishMenu = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi(`/api/v1/menus/${id}/publish`, {
        method: 'PATCH',
        token: freshToken,
      });

      if (response.success) {
        // Actualizar el estado del menú en la lista local
        setMenus(prevMenus => 
          prevMenus.map(menu => 
            menu.id === id ? { ...menu, status: 'publicada' as MenuStatus } : menu
          )
        );
        return true;
      }

      setError(response.error || `Error al publicar el menú con ID ${id}`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al publicar el menú con ID ${id}`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Archiva un menú (cambia su estado a 'archivada')
   */
  const archiveMenu = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const freshToken = getAuthToken();
      
      const response = await fetchApi(`/api/v1/menus/${id}/archive`, {
        method: 'PATCH',
        token: freshToken,
      });

      if (response.success) {
        // Actualizar el estado del menú en la lista local
        setMenus(prevMenus => 
          prevMenus.map(menu => 
            menu.id === id ? { ...menu, status: 'archivada' as MenuStatus } : menu
          )
        );
        return true;
      }

      setError(response.error || `Error al archivar el menú con ID ${id}`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al archivar el menú con ID ${id}`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    menus,
    loading,
    error,
    fetchMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    assignToArea,
    publishMenu,
    archiveMenu,
    getMenuWithItems
  };
}
