// Modelo para productos
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
  category_id: number;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string; // Viene en las respuestas detalladas
}

// Interfaces para solicitudes
export interface CreateProductRequest {
  name: string; // [2, 100] caracteres según documentación
  description: string | null; // Puede ser null según la API
  price: number; // > 0 según la API
  image?: string | null; // Puede ser null según la API
  is_available: boolean | null; // Puede ser null según la API
  category_id: number; // Debe ser un entero
  created_by?: number | null; // Puede ser null según la API
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  is_available?: boolean;
  category_id?: number;
}

export interface ProductAvailabilityRequest {
  is_available: boolean;
}
