// Modelo global para órdenes (Order) y sus items en el frontend
// Documenta y estandariza los tipos usados en toda la app

/**
 * Posibles valores para el status de una orden según backend:
 * - 'abierta': La orden está abierta y pendiente de preparación
 * - 'en_preparación': La orden está siendo preparada
 * - 'servida': La orden fue servida al cliente
 * - 'cobrada': La orden fue pagada y cerrada
 * - 'cancelada': La orden fue anulada
 */
export type OrderStatus =
  | "abierta"
  | "en_preparación"
  | "servida"
  | "cobrada"
  | "cancelada";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  note?: string | null;
  price: number;
  subtotal: number;
  status?: string; // status del item, si aplica
}

export interface Order {
  id: number;
  order_id: number; // ID único de la orden
  service_spot_id: number;
  sales_area_id: number;
  menu_id?: number;
  status: OrderStatus;
  created_at: string;
  closed_at?: string;
  created_by: number;
  closed_by?: number;
  items: OrderItem[];
  total: number;
  tax_amount?: number;
}
