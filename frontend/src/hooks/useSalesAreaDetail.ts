import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useSalesAreaDetail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchSalesArea = useCallback(async (areaId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/sales_areas/${areaId}`);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchSalesArea, loading, error, data };
}
