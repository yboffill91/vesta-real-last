import { useState, useCallback } from 'react';
import { fetchApi, getAuthToken } from '@/lib/api';
import { Product, CreateProductRequest, UpdateProductRequest, ProductAvailabilityRequest } from '@/models/product';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<Product[]>;
  getProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductRequest) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductRequest) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  updateProductAvailability: (id: number, data: ProductAvailabilityRequest) => Promise<Product | null>;
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

// Tipos específicos para las respuestas de productos
type ApiProductListResponse = ApiResponse<Product[]>;
type ApiProductSingleResponse = ApiResponse<Product>;

/**
 * Hook personalizado para gestionar operaciones CRUD de productos
 */
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene todos los productos del API
   */
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      // Usando el endpoint que incluye información de categorías
      const response = await fetchApi<ServerResponse<Product[]>>('/api/v1/products?include_category=true');
      
      // Verificar respuesta exitosa y que contenga datos válidos
      if (response.success && response.data) {
        // Guardamos la referencia en una variable local para que TypeScript entienda que ya no es undefined
        const responseData = response.data;
        const productList = responseData.data || [];
        
        setProducts(productList);
        return productList;
      } 
      
      // Manejar error
      setError(response.error || 'Error al obtener los productos');
      return [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al obtener los productos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un producto específico por su ID
   */
  const getProductById = useCallback(async (id: number): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ServerResponse<Product>>(`/api/v1/products/${id}`);

      if (response.success && response.data) {
        // Guardamos la referencia en una variable local para que TypeScript entienda que ya no es undefined
        const responseData = response.data;
        return responseData.data;
      }

      setError(response.error || `Error al obtener el producto con ID ${id}`);
      return null;
    } catch (err: any) {
      setError(err?.message || `Error al obtener el producto con ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo producto
   */
  const createProduct = useCallback(async (data: CreateProductRequest): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('useProducts - Enviando datos al API:', data);
      
      // Obtener token fresco para asegurar que no esté caducado
      const freshToken = getAuthToken();
      console.log('useProducts - Token disponible:', !!freshToken);
      
      // Modificación: pasar el objeto directamente sin JSON.stringify
      // La función fetchApi ya se encargará de serializarlo correctamente
      const response = await fetchApi<any>('/api/v1/products', {
        method: 'POST',
        body: data, // Quitamos JSON.stringify para evitar doble serialización
        // Forzar uso del token actual
        token: freshToken,
      });
      
      console.log('useProducts - Respuesta completa del API:', JSON.stringify(response, null, 2));

      // 1. Comprobar si la respuesta fue exitosa
      if (!response.success) {
        console.error('useProducts - Error en respuesta:', response.error);
        console.error('useProducts - Detalles completos de la respuesta:', response);
        // Intentar extraer más información de error si está disponible
        let errorDetail = response.error || 'Error al crear el producto';
        
        // Si hay datos en la respuesta, pueden contener detalles del error de validación
        if (response.data && typeof response.data === 'object') {
          if (response.data.detail) {
            errorDetail = `${errorDetail}: ${JSON.stringify(response.data.detail)}`;
          } else if (response.data.message) {
            errorDetail = `${errorDetail}: ${response.data.message}`;
          }
        }
        
        setError(errorDetail);
        return null;
      }
      
      // 2. Comprobar si existe response.data
      if (!response.data) {
        console.error('useProducts - No hay datos en la respuesta');
        setError('No se recibieron datos del servidor');
        return null;
      }
      
      console.log('useProducts - Estructura de response.data:', JSON.stringify(response.data, null, 2));
      
      let newProduct: Product;
      
      // 3. Comprobar la estructura de response.data
      if (response.data.data) {
        // Caso 1: La respuesta tiene formato { data: { data: Product } }
        console.log('useProducts - Usando data.data como producto');
        newProduct = response.data.data;
      } else if (response.data.id) {
        // Caso 2: La respuesta tiene formato { data: Product }
        console.log('useProducts - Usando data como producto directamente');
        newProduct = response.data;
      } else if (response.data.status === 'success' && response.data.data) {
        // Caso 3: La respuesta tiene formato { data: { status: 'success', data: Product } }
        console.log('useProducts - Usando formato status/data');
        newProduct = response.data.data;
      } else {
        // No pudimos identificar la estructura
        console.error('useProducts - Estructura de datos desconocida:', response.data);
        setError('Formato de respuesta inesperado');
        return null;
      }
      
      console.log('useProducts - Producto final extraído:', newProduct);
      
      if (!newProduct || typeof newProduct !== 'object' || !newProduct.id) {
        console.error('useProducts - Objeto de producto inválido:', newProduct);
        setError('El producto creado no tiene un formato válido');
        return null;
      }
      
      // Actualizar la lista de productos en el estado local
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al crear el producto';
      console.error('useProducts - Excepción:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un producto existente
   */
  const updateProduct = useCallback(async (id: number, data: UpdateProductRequest): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      // Eliminar JSON.stringify para evitar doble serialización
      const response = await fetchApi<ServerResponse<Product>>(`/api/v1/products/${id}`, {
        method: 'PUT',
        body: data, // Pasamos el objeto directamente sin JSON.stringify
      });

      if (response.success && response.data) {
        // Guardamos la referencia en una variable local para que TypeScript entienda que ya no es undefined
        const responseData = response.data;
        const updatedProduct = responseData.data;
        
        // Actualizar el producto en el estado local
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? updatedProduct : product
          )
        );
        return updatedProduct;
      }

      setError(response.error || `Error al actualizar el producto con ID ${id}`);
      return null;
    } catch (err: any) {
      setError(err?.message || `Error al actualizar el producto con ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un producto existente
   */
  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi<ApiProductSingleResponse>(`/api/v1/products/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Eliminar el producto del estado local
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        return true;
      }

      setError(response.error || `Error al eliminar el producto con ID ${id}`);
      return false;
    } catch (err: any) {
      setError(err?.message || `Error al eliminar el producto con ID ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza la disponibilidad de un producto
   */
  const updateProductAvailability = useCallback(async (id: number, data: ProductAvailabilityRequest): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      // Eliminar JSON.stringify para evitar doble serialización
      const response = await fetchApi<ServerResponse<Product>>(`/api/v1/products/${id}/availability`, {
        method: 'PATCH',
        body: data, // Pasamos el objeto directamente sin JSON.stringify
      });

      if (response.success && response.data) {
        // Guardamos la referencia en una variable local para que TypeScript entienda que ya no es undefined
        const responseData = response.data;
        const updatedProduct = responseData.data;
        
        // Actualizar el producto en el estado local
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? { ...product, is_available: data.is_available } : product
          )
        );
        return updatedProduct;
      }

      setError(response.error || `Error al actualizar la disponibilidad del producto con ID ${id}`);
      return null;
    } catch (err: any) {
      setError(err?.message || `Error al actualizar la disponibilidad del producto con ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductAvailability,
  };
}
