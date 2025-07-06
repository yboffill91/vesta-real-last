"use client";
import { useMenusWithItems } from "@/hooks/useMenusWithItems";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

import { Tabs, TabsContent, TabsTrigger } from "../ui/tabs";
import { MenuProductTabs } from "./MenuProductTabs";
import { useOrderStore } from "@/store/orderStore";
import { OrderRectifyTable } from "./OrderRectifyTable";

export interface OrderMenuTabsProps {
  onSelectItem?: (item: any) => void;
}

export function OrderMenuTabs({ onSelectItem }: OrderMenuTabsProps) {
  // --- HOOKS Y ESTADO ---
  const { menus, loading, error } = useMenusWithItems();
  const orderProducts = useOrderStore((state) => state.products);
  const setMeta = useOrderStore((state) => state.setMeta);
  const addProduct = useOrderStore((state) => state.addProduct);
  const [rectifyMode, setRectifyMode] = useState(false);
  const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [errorItems, setErrorItems] = useState<Record<string, string | null>>({});
  const publishedMenus = menus.filter((menu) => menu.status === "publicada");
  const [activeMenuId, setActiveMenuId] = useState("");

  // --- EFECTOS ---
  // Inicializar tab activo cuando hay menús publicados
  useEffect(() => {
    if (!activeMenuId && publishedMenus.length > 0) {
      setActiveMenuId(publishedMenus[0].id.toString());
    }
  }, [publishedMenus, activeMenuId]);

  // Cargar productos de cada menú publicado
  useEffect(() => {
    publishedMenus.forEach((menu) => {
      const menuId = menu.id.toString();
      if (menuItems[menuId] !== undefined || loadingItems[menuId]) return;
      setLoadingItems((prev) => ({ ...prev, [menuId]: true }));
      setErrorItems((prev) => ({ ...prev, [menuId]: null }));
      fetchApi(`/api/v1/menus/${menu.id}`)
        .then((response) => {
          if (response?.data?.data?.items) {
            setMenuItems((prev) => ({ ...prev, [menuId]: response.data.data.items }));
          } else {
            setMenuItems((prev) => ({ ...prev, [menuId]: [] }));
          }
        })
        .catch((err) => {
          setErrorItems((prev) => ({ ...prev, [menuId]: err.message || "Error al cargar productos del menú" }));
        })
        .finally(() => {
          setLoadingItems((prev) => ({ ...prev, [menuId]: false }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedMenus]);

  // --- EARLY RETURNS ---
  if (loading) return <div className="text-center py-8">Cargando menús...</div>;
  if (error) return <div className="text-destructive text-center py-8">{error}</div>;
  if (!publishedMenus.length) {
    return <div className="text-muted-foreground text-center py-8">No hay menús publicados disponibles.</div>;
  }
  if (rectifyMode) {
    return <OrderRectifyTable onBack={() => setRectifyMode(false)} />;
  }

  // --- RENDER ---
  return (
    <>
      <Tabs
        defaultValue={publishedMenus[0].id.toString()}
        value={activeMenuId}
        onValueChange={setActiveMenuId}
        className="w-full"
      >
        {/* Tabs de menús */}
        <div className="flex gap-2 border-b mb-4">
          {publishedMenus.map((menu) => (
            <TabsTrigger
              key={menu.id}
              value={menu.id.toString()}
              className="px-4 py-2"
            >
              {menu.name}
            </TabsTrigger>
          ))}
        </div>
        {/* Contenido de cada menú por tab */}
        {publishedMenus.map((menu) => {
          const menuId = menu.id.toString();
          const items = menuItems[menuId] || [];
          const isLoading = loadingItems[menuId];
          const isError = errorItems[menuId];
          return (
            <TabsContent
              key={menu.id}
              value={menu.id.toString()}
              className="pt-4"
            >
              {isLoading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : isError ? (
                <div className="text-destructive text-center py-8">{isError}</div>
              ) : (
                <MenuProductTabs
                  products={items}
                  menuId={menu.id}
                  onAdd={(product) => {
                    setMeta({ menu_id: menu.id });
                    addProduct(product);
                  }}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      {/* Botón para rectificar orden */}
      {orderProducts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            className="bg-primary text-white rounded px-6 py-3 font-semibold shadow hover:bg-primary/90 transition"
            onClick={() => setRectifyMode(true)}
          >
            Rectificar orden
          </button>
        </div>
      )}
    </>
  );
}
