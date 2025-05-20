import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
// Define aquí el tipo Establishment según tu modelo real
export interface Establishment {
  id: number;
  name: string;
  address?: string;
  // ...otros campos relevantes
}

export function useEstablishment() {
  const [establishment, setEstablishment] = useState<Establishment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEstablishment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, data, error, status } = await fetchApi("/api/v1/establishment/");
      if (!success) {
        if (status === 404) {
          setEstablishment(null);
          setError(null);
        } else {
          setError(error || "No se pudo obtener el establecimiento");
          setEstablishment(null);
        }
      } else if (data && data.data) {
        setEstablishment(data.data);
      } else if (data) {
        setEstablishment(data);
      } else {
        setEstablishment(null);
      }
    } catch (e: any) {
      setError(e.message || "Error desconocido");
      setEstablishment(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getEstablishment();
  }, [getEstablishment]);

  return { establishment, loading, error, reload: getEstablishment };
}
