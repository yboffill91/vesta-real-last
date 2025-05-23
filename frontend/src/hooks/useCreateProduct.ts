import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const createProduct = async (product: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi("/api/products", {
        method: "POST",
        body: JSON.stringify(product),
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

  return { createProduct, loading, error, data };
}
