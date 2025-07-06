import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface MenuItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_available: boolean;
  category_id: number;
  category_name: string;
}

export function useMenuItems(menuId: number | string, enabled: boolean = true) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    fetchApi(`/api/v1/menus/${menuId}`)
      .then((response) => {
        if (response?.data?.data?.items) {
          setItems(response.data.data.items);
        } else {
          setItems([]);
        }
      })
      .catch((err) => {
        setError(err.message || "Error al cargar productos del menú");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [menuId, enabled]);

  return { items, loading, error };
}
