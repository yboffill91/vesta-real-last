import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { ServiceSpot } from "./useServiceSpots";

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
        if (res.success && Array.isArray(res.data.data)) {
          setAreas(
            res.data.data.map((area: any) => ({
              ...area,
              created_at: area.created_at ? String(area.created_at) : undefined,
              updated_at: area.updated_at ? String(area.updated_at) : undefined,
              service_spots: Array.isArray(area.service_spots)
                ? area.service_spots.map((spot: any) => ({
                    ...spot,
                    created_at: spot.created_at
                      ? String(spot.created_at)
                      : undefined,
                    updated_at: spot.updated_at
                      ? String(spot.updated_at)
                      : undefined,
                  }))
                : [],
            }))
          );
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
