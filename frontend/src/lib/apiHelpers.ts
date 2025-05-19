/**
 * Funciones helper para interactuar con la API
 */
import { fetchApi } from './api';

// Tipos para los endpoints principales
export type User = {
  id: number;
  username: string;
  name: string;
  surname: string;
  role: string;
};

export type Menu = {
  id: number;
  name: string;
  valid_date: string;
  status: string;
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image?: string;
};

export type Order = {
  id: number;
  service_spot_id: number;
  created_at: string;
  total: number;
  status: string;
};

/**
 * Helpers para endpoints comunes
 */
export const apiClient = {
  // Autenticación
  auth: {
    login: (email: string, password: string) => {
      console.log('Intentando login con:', { username: email });
      return fetchApi<{ access_token: string, token_type: string, user: User }>('/api/v1/auth/login', { 
        method: 'POST', 
        body: { username: email, password },
        noToken: true
      }).then(response => {
        console.log('Respuesta de login:', response);
        return response;
      }).catch(error => {
        console.error('Error en login:', error);
        throw error;
      });
    },
    me: (token: string) => {
      console.log('Solicitando perfil de usuario');
      return fetchApi<User>('/api/v1/users/me', { token });
    },
  },
  
  // Usuarios
  users: {
    getAll: (token: string) => 
      fetchApi<User[]>('/api/users', { token }),
    getById: (token: string, id: number) => 
      fetchApi<User>(`/api/users/${id}`, { token }),
    create: (token: string, data: Omit<User, 'id'>) => 
      fetchApi<User>('/api/users', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: Partial<User>) => 
      fetchApi<User>(`/api/users/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/users/${id}`, { method: 'DELETE', token }),
  },
  
  // Menús
  menus: {
    getAll: (token: string) => 
      fetchApi<Menu[]>('/api/menus', { token }),
    getById: (token: string, id: number) => 
      fetchApi<Menu>(`/api/menus/${id}`, { token }),
    create: (token: string, data: Omit<Menu, 'id'>) => 
      fetchApi<Menu>('/api/menus', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: Partial<Menu>) => 
      fetchApi<Menu>(`/api/menus/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/menus/${id}`, { method: 'DELETE', token }),
    getItems: (token: string, menuId: number) => 
      fetchApi(`/api/menus/${menuId}/items`, { token }),
  },
  
  // Productos
  products: {
    getAll: (token: string) => 
      fetchApi<Product[]>('/api/products', { token }),
    getById: (token: string, id: number) => 
      fetchApi<Product>(`/api/products/${id}`, { token }),
    create: (token: string, data: Omit<Product, 'id'>) => 
      fetchApi<Product>('/api/products', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: Partial<Product>) => 
      fetchApi<Product>(`/api/products/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/products/${id}`, { method: 'DELETE', token }),
  },
  
  // Órdenes
  orders: {
    getAll: (token: string) => 
      fetchApi<Order[]>('/api/orders', { token }),
    getById: (token: string, id: number) => 
      fetchApi<Order>(`/api/orders/${id}`, { token }),
    create: (token: string, data: Omit<Order, 'id' | 'created_at'>) => 
      fetchApi<Order>('/api/orders', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: Partial<Order>) => 
      fetchApi<Order>(`/api/orders/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/orders/${id}`, { method: 'DELETE', token }),
  },
  
  // Categorías
  categories: {
    getAll: (token: string) => 
      fetchApi('/api/categories', { token }),
    getById: (token: string, id: number) => 
      fetchApi(`/api/categories/${id}`, { token }),
    create: (token: string, data: any) => 
      fetchApi('/api/categories', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: any) => 
      fetchApi(`/api/categories/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/categories/${id}`, { method: 'DELETE', token }),
  },
  
  // Puestos de servicio
  serviceSpots: {
    getAll: (token: string) => 
      fetchApi('/api/service_spots', { token }),
    getById: (token: string, id: number) => 
      fetchApi(`/api/service_spots/${id}`, { token }),
    create: (token: string, data: any) => 
      fetchApi('/api/service_spots', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: any) => 
      fetchApi(`/api/service_spots/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/service_spots/${id}`, { method: 'DELETE', token }),
  },
  
  // Áreas de venta
  salesAreas: {
    getAll: (token: string) => 
      fetchApi('/api/sales_areas', { token }),
    getById: (token: string, id: number) => 
      fetchApi(`/api/sales_areas/${id}`, { token }),
    create: (token: string, data: any) => 
      fetchApi('/api/sales_areas', { method: 'POST', body: data, token }),
    update: (token: string, id: number, data: any) => 
      fetchApi(`/api/sales_areas/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: number) => 
      fetchApi(`/api/sales_areas/${id}`, { method: 'DELETE', token }),
  },
  
  // Establecimiento
  establishment: {
    getInfo: (token: string) => 
      fetchApi('/api/establishment', { token }),
    update: (token: string, data: any) => 
      fetchApi('/api/establishment', { method: 'PUT', body: data, token }),
  },
  
  // Estado de la base de datos
  health: {
    check: () => 
      fetchApi('/api/db_health'),
  }
};
