import { useState } from "react";
import { fetchApi } from "@/lib/api";

export interface CreateSalesAreaPayload {
  name: string;
  description?: string;
  is_active: boolean;
  establishment_id: number;
}

export function useCreateSalesArea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createSalesArea = async (data: CreateSalesAreaPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetchApi("/api/v1/sales-areas/", {
        method: "POST",
        body: data,
      });
      if (!res.success) {
        throw new Error(res.error || "Error al crear el área de venta");
      }
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createSalesArea, loading, error, success };
}
