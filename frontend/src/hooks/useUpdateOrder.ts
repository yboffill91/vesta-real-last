import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useUpdateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const updateOrder = async (orderId: number | string, orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(orderData),
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

  return { updateOrder, loading, error, data };
}
