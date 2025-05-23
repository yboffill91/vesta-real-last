import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

export function useMenu() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchMenu = useCallback(async (menuId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/menus/${menuId}`);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchMenu, loading, error, data };
}
