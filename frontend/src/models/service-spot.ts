// Tipado para un puesto de servicio (ServiceSpot) en el frontend
export interface ServiceSpot {
  id: number;
  name: string;
  status: "libre" | "pedido_abierto" | "cobrado" | "ocupado" | "reservado";
  is_active: boolean;
  order_id?: number; // Solo presente si status === 'pedido_abierto'
  // Otros campos opcionales según backend
  [key: string]: any;
}
