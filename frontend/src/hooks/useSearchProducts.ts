import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useSearchProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(
        `/api/products/search/${encodeURIComponent(query)}`
      );
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchProducts, loading, error, data };
}
