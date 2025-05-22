import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useDeleteSalesArea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteSalesArea = async (areaId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { success, error } = await fetchApi(`/api/v1/sales-areas/${areaId}`, {
        method: "DELETE",
      });
      if (!success) throw new Error(error || "Error al eliminar área de venta");
      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteSalesArea, loading, error, success };
}
