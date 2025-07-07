import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Order } from "@/models/order";

export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Order | null>(null);

  const fetchOrder = useCallback(async (orderId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/orders/${orderId}`);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchOrder, loading, error, data };
}
