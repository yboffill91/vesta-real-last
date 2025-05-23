import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export function useProductCategories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApi("/api/categories")
      .then(setData)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { loading, error, data };
}
