import { useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";

// Definir los posibles estados de un puesto de servicio según la especificación
export type ServiceSpotStatus = "libre" | "pedido_abierto" | "cobrado";

export interface ServiceSpot {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  status: ServiceSpotStatus;
  is_active: boolean;
  sales_area_id: number;
  sales_area?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// DTOs para crear y actualizar puestos
export interface CreateServiceSpotDTO {
  name: string;
  description?: string;
  capacity: number;
  sales_area_id: number;
}

export interface UpdateServiceSpotDTO extends Partial<CreateServiceSpotDTO> {
  status?: ServiceSpotStatus;
  is_active?: boolean;
}

export function useServiceSpots() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spots, setSpots] = useState<ServiceSpot[]>([]);

  // Obtener todos los puestos de servicio
  const fetchServiceSpots = useCallback(
    async (filters?: {
      sales_area_id?: number;
      status?: ServiceSpotStatus;
      active_only?: boolean;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();

        if (filters?.sales_area_id) {
          query.append("sales_area_id", filters.sales_area_id.toString());
        }
        if (filters?.status) {
          query.append("status", filters.status);
        }
        if (filters?.active_only !== undefined) {
          query.append("active_only", filters.active_only.toString());
        }

        const queryString = query.toString();
        const response = await fetchApi(
          `/api/v1/service-spots${queryString ? `?${queryString}` : ""}`
        );

        if (response.success && response.data) {
          // Manejar la estructura anidada donde los datos están en response.data.data
          if (response.data.data && Array.isArray(response.data.data)) {
            setSpots(response.data.data);
          } else if (Array.isArray(response.data)) {
            setSpots(response.data);
          } else {
            setSpots([]);
          }
        } else {
          setError(response.error || "Error al cargar los puestos de servicio");
        }

        setLoading(false);
        return response;
      } catch (err: any) {
        const errorMsg =
          err.message || "Error al cargar los puestos de servicio";
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Obtener un puesto de servicio por ID
  const getServiceSpot = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/v1/service-spots/${id}`);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMsg =
        err.message || `Error al cargar el puesto de servicio ${id}`;
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Crear un nuevo puesto de servicio
  const createServiceSpot = useCallback(async (data: CreateServiceSpotDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi("/api/v1/service-spots", {
        method: "POST",
        body: data,
      });

      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || "Error al crear el puesto de servicio";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Actualizar un puesto de servicio existente
  const updateServiceSpot = useCallback(
    async (id: number, data: UpdateServiceSpotDTO) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchApi(`/api/v1/service-spots/${id}`, {
          method: "PUT",
          body: data,
        });

        setLoading(false);
        return response;
      } catch (err: any) {
        const errorMsg =
          err.message || `Error al actualizar el puesto de servicio ${id}`;
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Eliminar un puesto de servicio
  const deleteServiceSpot = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/v1/service-spots/${id}`, {
        method: "DELETE",
      });

      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMsg =
        err.message || `Error al eliminar el puesto de servicio ${id}`;
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Contar puestos por área
  const countServiceSpotsByArea = useCallback(async (areaId: number) => {
    try {
      const response = await fetchApi(
        `/api/v1/service-spots?sales_area_id=${areaId}&active_only=true`
      );

      const count =
        response.success && Array.isArray(response.data)
          ? response.data.length
          : 0;

      return { success: true, count };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }, []);

  return {
    spots,
    loading,
    error,
    fetchServiceSpots,
    getServiceSpot,
    createServiceSpot,
    updateServiceSpot,
    deleteServiceSpot,
    countServiceSpotsByArea,
  };
}
