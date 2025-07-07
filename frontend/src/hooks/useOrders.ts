import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

import { Order } from "@/models/order";

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Order[] | null>(null);

  const fetchOrders = useCallback(async (params: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params).toString();
      // Siempre usar el endpoint correcto con prefijo y slash final
      const url = query ? `/api/v1/orders/?${query}` : "/api/v1/orders/";
      const response = await fetchApi(url);
      // El backend responde {status, message, data: Array}
      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  console.log(data);

  return { fetchOrders, loading, error, data };
}
