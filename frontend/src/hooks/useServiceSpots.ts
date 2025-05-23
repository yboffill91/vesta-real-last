import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export interface ServiceSpot {
  id: number;
  name: string;
  description?: string;
  status?: string;
  is_active: boolean;
  establishment_id: number;
  created_at: string;
  updated_at: string;
}

interface ServiceSpotsResponse {
  status: string;
  message: string;
  data: ServiceSpot[];
}

export function useServiceSpots() {
  const [spots, setSpots] = useState<ServiceSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/api/v1/sales-areas/", { method: "GET" })
      .then((res: any) => {
        if (res.success && res.data && Array.isArray(res.data.data)) {
          setSpots(res.data.data);
        } else {
          setError(res.error || res.message || "Error inesperado al cargar los puestos/mesas.");
        }
      })
      .catch(() => setError("Error de conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  return { spots, loading, error };
}
