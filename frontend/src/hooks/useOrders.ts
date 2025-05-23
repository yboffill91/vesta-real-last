import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchOrders = useCallback(async (params: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `/api/orders?${query}` : "/api/orders";
      const response = await fetchApi(url);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchOrders, loading, error, data };
}
