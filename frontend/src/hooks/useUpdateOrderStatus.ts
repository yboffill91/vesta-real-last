import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const updateOrderStatus = async (
    orderId: number | string,
    statusUpdate: any
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(statusUpdate),
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

  return { updateOrderStatus, loading, error, data };
}
