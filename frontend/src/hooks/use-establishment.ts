import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
// Define aquí el tipo Establishment según tu modelo real
export interface Establishment {
  id: number;
  name: string;
  address: string;
  phone: string;
  logo: string;
  tax_rate: number;
  currency: string;
  is_configured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstablishmentEditPayload {
  name: string;
  address: string;
  phone: string;
  logo?: string;
  tax_rate: number;
  currency: "CUP" | "USD";
  is_configured?: boolean;
}

export function useEditEstablishment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editEstablishment = async (data: EstablishmentEditPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { success: ok, data: respData, error: respError } = await fetchApi<Establishment>(
        "/api/v1/establishment/",
        {
          method: "PUT",
          body: data,
        }
      );
      if (!ok) {
        throw new Error(respError || "Error al actualizar establecimiento");
      }
      setSuccess(true);
      return respData;
    } catch (err: any) {
      setError(err.message || "Error de red");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editEstablishment, loading, error, success };
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
      const { success, data, error, status } = await fetchApi(
        "/api/v1/establishment/"
      );
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

// Nuevo hook para obtener múltiples establecimientos
export function useEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEstablishments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, data, error } = await fetchApi("/api/v1/establishment/", { method: "GET" });
      if (!success) {
        setError(error || "No se pudo obtener los establecimientos");
        setEstablishments([]);
      } else if (Array.isArray(data)) {
        // La API devuelve [{ status, message, data }, ...]
        setEstablishments(data.map((item: any) => item.data));
      } else if (data && data.results && Array.isArray(data.results)) {
        setEstablishments(data.results.map((item: any) => item.data));
      } else if (data && data.data) {
        setEstablishments([data.data]);
      } else if (data) {
        setEstablishments([data]);
      } else {
        setEstablishments([]);
      }
    } catch (e: any) {
      setError(e.message || "Error desconocido");
      setEstablishments([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getEstablishments();
  }, [getEstablishments]);

  return { establishments, loading, error, reload: getEstablishments };
}
