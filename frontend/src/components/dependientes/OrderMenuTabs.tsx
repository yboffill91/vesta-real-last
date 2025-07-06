"use client";
import { useMenusWithItems } from "@/hooks/useMenusWithItems";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsTrigger } from "../ui/tabs";
import { MenuProductTabs } from "./MenuProductTabs";

export interface OrderMenuTabsProps {
  onSelectItem?: (item: any) => void;
}

export function OrderMenuTabs({ onSelectItem }: OrderMenuTabsProps) {
  const { menus, loading, error, refetch } = useMenusWithItems();

  // publishedMenus debe calcularse siempre igual, nunca condicional
  const publishedMenus = menus.filter((menu) => menu.status === "publicada");

  // Estado local para los items, loading y error por menú
  const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [errorItems, setErrorItems] = useState<Record<string, string | null>>({});

  useEffect(() => {
    publishedMenus.forEach((menu) => {
      const menuId = menu.id.toString();
      if (menuItems[menuId] !== undefined || loadingItems[menuId]) return; // ya cargado o cargando
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

  if (loading) {
    return <div className="text-center py-8">Cargando menús...</div>;
  }
  if (error) {
    return <div className="text-destructive text-center py-8">{error}</div>;
  }
  if (!publishedMenus.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No hay menús publicados disponibles.
      </div>
    );
  }


  return (
    <Tabs defaultValue={publishedMenus[0].id.toString()} className="w-full">
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
      {publishedMenus.map((menu) => {
        const menuId = menu.id.toString();
        const items = menuItems[menuId] || [];
        const loading = loadingItems[menuId];
        const error = errorItems[menuId];
        return (
          <TabsContent key={menu.id} value={menu.id.toString()} className="pt-4">
            <Card className="bg-card/50 border">
              <CardHeader>
                <CardTitle>{menu.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Cargando productos...</div>
                ) : error ? (
                  <div className="text-destructive text-center py-4">{error}</div>
                ) : items && items.length > 0 ? (
                  <MenuProductTabs products={items} onAdd={onSelectItem} />
                ) : (
                  <div className="text-muted-foreground text-center py-4">
                    No hay productos en este menú.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
