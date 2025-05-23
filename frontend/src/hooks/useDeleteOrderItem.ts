import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useDeleteOrderItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const deleteOrderItem = useCallback(
    async (orderId: number | string, itemId: number | string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchApi(
          `/api/orders/${orderId}/items/${itemId}`,
          {
            method: "DELETE",
          }
        );
        setData(response);
        return response;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { deleteOrderItem, loading, error, data };
}
