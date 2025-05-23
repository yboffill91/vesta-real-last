import { useState } from "react";
import { fetchApi } from "@/lib/api";

export function useUpdateMenu() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const updateMenu = async (menuId: number | string, menuData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApi(`/api/menus/${menuId}`, {
        method: "PUT",
        body: JSON.stringify(menuData),
        headers: { "Content-Type": "application/json" },
      });
      setData(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateMenu, loading, error, data };
}
