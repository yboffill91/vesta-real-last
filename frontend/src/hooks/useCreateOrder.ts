import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const createOrder = async (order: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log("[useCreateOrder] Payload enviado:", order);
      console.log("[useCreateOrder] typeof order.created_by:", typeof order.created_by, order.created_by);
      const response = await fetchApi("/api/v1/orders/", {
        method: "POST",
        body: order,
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

  return { createOrder, loading, error, data };
}
