// Definición de los estados posibles para un menú
export type MenuStatus = 'borrador' | 'publicada' | 'archivada';

// Interfaz para el menú
export interface Menu {
  id: number;
  name: string;
  description: string | null;
  valid_date: string; // Formato ISO de fecha
  status: MenuStatus;
  created_at: string;
  updated_at: string;
}

// Interfaz para los items del menú (productos asociados)
export interface MenuItem {
  id: number;
  menu_id: number;
  product_id: number;
  product_name?: string; // Incluido cuando se obtiene con el producto
  price: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos adicionales que pueden venir del backend
  product_description?: string;
  product_image?: string;
  category_id?: number;
  category_name?: string;
}

// Interfaz para las áreas de venta asignadas al menú
export interface MenuSalesArea {
  menu_id: number;
  sales_area_id: number;
  sales_area_name?: string; // Incluido cuando se obtiene con el área
}

// Interfaces para las solicitudes al API

export interface CreateMenuRequest {
  name: string;
  description?: string;
  valid_date: string; // Formato ISO de fecha
  status?: MenuStatus; // Por defecto 'borrador'
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  valid_date?: string;
  status?: MenuStatus;
}

export interface AddMenuItemRequest {
  product_id: number;
  price: number;
  is_available?: boolean; // Por defecto true
}

export interface AssignToAreaRequest {
  sales_area_id: number;
}
