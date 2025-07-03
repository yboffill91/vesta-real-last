import { useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/models/category';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<Category[]>;
  getCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryRequest) => Promise<Category | null>;
  updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;
}

// Interfaces para las respuestas API para garantizar tipos seguros
interface ApiCategoryListResponse {
  data: Category[];
}

interface ApiCategorySingleResponse {
  data: Category;
}

/**
 * Hook personalizado para gestionar operaciones CRUD de categorías
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene todas las categorías del API
   */
  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ApiCategoryListResponse>('/api/v1/categories');
      
      // Verificar respuesta exitosa y que contenga datos válidos
      if (response.success && response.data && Array.isArray(response.data.data)) {
        const categoryList = response.data.data || [];
        setCategories(categoryList);
        return categoryList;
      } 
      
      // Manejar error
      setError(response.error || 'Error al obtener las categorías');
      return [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al obtener las categorías';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene una categoría por su ID
   */
  const getCategoryById = useCallback(async (id: number): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ApiCategorySingleResponse>(`/api/v1/categories/${id}`);
      
      // Verificar respuesta exitosa y datos válidos
      if (response.success && response.data && response.data.data) {
        return response.data.data;
      }
      
      // Manejar error
      setError(response.error || `Error al obtener la categoría con ID ${id}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al obtener la categoría con ID ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva categoría
   */
  const createCategory = useCallback(async (data: CreateCategoryRequest): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ApiCategorySingleResponse>('/api/v1/categories', {
        method: 'POST',
        body: data,
      });
      
      // Verificar respuesta exitosa y datos válidos
      if (response.success && response.data && response.data.data) {
        const newCategory = response.data.data;
        // Actualizar la lista de categorías
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      }
      
      // Manejar error
      setError(response.error || 'Error al crear la categoría');
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al crear la categoría';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una categoría existente
   */
  const updateCategory = useCallback(async (id: number, data: UpdateCategoryRequest): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ApiCategorySingleResponse>(`/api/v1/categories/${id}`, {
        method: 'PUT',
        body: data,
      });

      // Verificar respuesta exitosa y datos válidos
      if (response.success && response.data && response.data.data) {
        const updatedCategory = response.data.data;
        // Actualizar la categoría en la lista local
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? updatedCategory : cat))
        );
        return updatedCategory;
      }
      
      // Manejar error
      setError(response.error || `Error al actualizar la categoría con ID ${id}`);
      return null;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al actualizar la categoría con ID ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina una categoría por su ID
   */
  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/v1/categories/${id}`, {
        method: 'DELETE',
      });
      
      // Verificar respuesta exitosa
      if (response.success) {
        // Eliminar la categoría de la lista local
        setCategories(prev => prev.filter(cat => cat.id !== id));
        return true;
      }
      
      // Manejar error
      setError(response.error || `Error al eliminar la categoría con ID ${id}`);
      return false;
    } catch (err: any) {
      const errorMessage = err?.message || `Error al eliminar la categoría con ID ${id}`;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
