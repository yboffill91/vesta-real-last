import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { SalesArea } from "@/models/sales-area";

interface EditSalesAreaInput {
  name: string;
  description?: string;
  is_active: true;
  establishment_id: number;
}

export function useEditSalesArea(areaId: number, initialData: SalesArea) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editSalesArea = async (
    input: Omit<EditSalesAreaInput, "establishment_id">
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        ...input,
        is_active: true,
        establishment_id: initialData.establishment_id, // no editable
      };
      console.log("[useEditSalesArea] PUT /api/v1/sales-areas/" + areaId, payload);
      const { success, error } = await fetchApi(
        `/api/v1/sales-areas/${areaId}`,
        {
          method: "PUT",
          body: payload, // fetchApi ya hace el JSON.stringify
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!success) throw new Error(error || "Error al editar área de venta");
      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editSalesArea, loading, error, success };
}
