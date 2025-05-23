import { useState } from "react";
import { useCreateOrder } from "./useCreateOrder";

// Utilidad para crear items de orden
async function createOrderItem(orderId: number, item: any) {
  const response = await fetch(`/api/v1/orders/${orderId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.detail || "Error al agregar item");
  }
  return await response.json();
}

export function useCreateOrderWithItems() {
  const { createOrder } = useCreateOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // orderData: datos de orden (sin items), items: array de items (sin order_id)
  const createOrderWithItems = async (orderData: any, items: any[]) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // 1. Crear la orden
      const order = await createOrder(orderData);
      const orderId = order.data?.id;
      if (!orderId) throw new Error("No se pudo obtener el ID de la orden");
      // 2. Agregar todos los items en paralelo
      await Promise.all(
        items.map((item) =>
          createOrderItem(orderId, { ...item, order_id: orderId })
        )
      );
      setSuccess(true);
      return orderId;
    } catch (err: any) {
      setError(err.message || "Error al crear la orden con items");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createOrderWithItems, loading, error, success };
}
