import { useEffect, useState } from "react";

export interface ProductInCategory {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  products: ProductInCategory[];
}

export function useCategoriesWithProducts() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    import("@/lib/api").then(({ fetchApi }) => {
      fetchApi<CategoryWithProducts[]>("/api/v1/products-grouped/")
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCategories(res.data);
          } else {
            setError(res.error || "Error al obtener categorías y productos");
          }
        })
        .catch((err) => {
          setError(err.message || "Error desconocido");
        })
        .finally(() => setLoading(false));
    });
  }, []);

  return { categories, loading, error };
}
