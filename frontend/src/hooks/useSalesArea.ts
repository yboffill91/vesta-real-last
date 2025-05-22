import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { SalesArea } from "@/models/sales-area";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export function useSalesArea(areaId: number) {
  const [area, setArea] = useState<SalesArea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!areaId || typeof areaId !== "number" || isNaN(areaId)) return;
    setLoading(true);
    setError(null);
    fetchApi(`/api/v1/sales-areas/${areaId}`)
      .then((response: any) => {
        if ((response.status === "success" || response.success) && response.data) {
          setArea(response.data);
        } else {
          setArea(null);
          setError(response.error || response.message || "No se pudo obtener el área de venta");
        }
      })
      .catch((err: any) => {
        setArea(null);
        setError(err?.message || "Error inesperado al obtener área de venta");
      })
      .finally(() => setLoading(false));
  }, [areaId]);

  return { area, loading, error };
}
