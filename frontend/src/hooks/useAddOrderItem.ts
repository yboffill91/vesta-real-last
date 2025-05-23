import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useAddOrderItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const addOrderItem = async (orderId: number | string, item: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" },
      });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addOrderItem, loading, error, data };
}
