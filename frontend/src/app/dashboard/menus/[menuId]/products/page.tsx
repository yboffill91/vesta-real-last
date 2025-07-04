"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MenuProductAssignment } from "@/components/dashboard/menus/MenuProductAssignment";
import { FormWrapper } from "@/components/ui";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/models/menu";

export default function MenuProductsPage() {
  const params = useParams();
  const menuId = Number(params.menuId);
  const { getMenuById, getMenuWithItems, loading, error } = useMenus();
  const [menu, setMenu] = useState<Menu | null>(null);
  
  useEffect(() => {
    const fetchMenu = async () => {
      if (menuId) {
        // Primero obtener datos básicos del menú
        const menuData = await getMenuById(menuId);
        if (menuData) {
          setMenu(menuData);
          
          // Luego obtener el menú con sus productos
          const menuWithItems = await getMenuWithItems(menuId);
          if (menuWithItems) {
            setMenu(menuWithItems);
          }
        }
      }
    };
    
    fetchMenu();
  }, [menuId, getMenuById, getMenuWithItems]);

  if (loading) {
    return <div className="p-4">Cargando información del menú...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error al cargar el menú: {error}
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="p-4 text-amber-500">
        No se encontró el menú solicitado
      </div>
    );
  }

  return (
    <FormWrapper
      title={`Asignación de Productos - ${menu.name}`}
      subtitle={`Selecciona los productos para este menú y establece sus precios`}
    >
      <MenuProductAssignment menu={menu} />
    </FormWrapper>
  );
}
