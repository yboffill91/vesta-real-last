import { useState } from "react";

export function useUpdateServiceSpotStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const updateStatus = async (spotId: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/service-spots/${spotId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      setData(result);
      if (!response.ok) throw new Error(result.detail || "Error al actualizar estado del puesto");
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error, data };
}
