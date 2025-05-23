import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

import type { ServiceSpot } from "@/components/dependientes/TableCardWrapper";

export interface SalesArea {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  establishment_id?: number;
  created_at?: string;
  updated_at?: string;
  service_spots?: ServiceSpot[];
}

export function useSalesAreas() {
  const [areas, setAreas] = useState<SalesArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/api/v1/sales-areas/", { method: "GET" })
      .then((res) => {
        if (res.success) {
          setAreas(res.data.data || []);
        } else {
          setError(
            res.error || "Error inesperado al cargar las áreas de venta."
          );
        }
      })
      .catch(() => setError("Error de conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  return { areas, loading, error };
}
