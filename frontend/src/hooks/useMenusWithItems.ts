"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface MenuProduct {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_available: boolean;
  category_id: number;
  category_name: string;
}

export interface MenuWithItems {
  id: number;
  name: string;
  status: string;
  valid_date: string;
  items: MenuProduct[];
}

export function useMenusWithItems() {
  const [menus, setMenus] = useState<MenuWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = () => {
    setLoading(true);
    setError(null);
    fetchApi("/api/v1/menus?active_only=true")
      .then((response) => {
        if (response?.data.data) {
          setMenus(response.data.data);
        } else {
          setMenus([]);
        }
      })
      .catch((err) => {
        setError(err.message || "Error al cargar menús");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return { menus, loading, error, refetch: fetchMenus };
}
