// Modelo de área de venta
export interface SalesArea {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  establishment_id: number;
  created_at: string;
  updated_at: string;
}
