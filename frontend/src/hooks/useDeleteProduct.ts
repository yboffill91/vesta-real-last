import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const deleteProduct = useCallback(async (productId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/products/${productId}`, {
        method: "DELETE",
      });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteProduct, loading, error, data };
}
