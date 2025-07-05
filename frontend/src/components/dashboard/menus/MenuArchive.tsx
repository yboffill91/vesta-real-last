"use client";

import React, { useState, useEffect } from "react";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/models/menu";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

// Función para formatear fechas sin dependencias externas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

interface MenuArchiveProps {
  title?: string;
}

export const MenuArchive = ({ title = "Menús Archivados" }: MenuArchiveProps = {}) => {
  const { menus, loading, fetchMenus, error } = useMenus();
  const [searchTerm, setSearchTerm] = useState("");
  const [archivedMenus, setArchivedMenus] = useState<Menu[]>([]);

  // Cargar menús al montar el componente
  useEffect(() => {
    // @ts-ignore: Estamos usando la versión actualizada de fetchMenus que acepta el parámetro showAllMenus
    fetchMenus(undefined, true);
  }, [fetchMenus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrar menús archivados cuando cambian los menús
  useEffect(() => {
    if (menus && Array.isArray(menus)) {
      const onlyArchived = menus.filter(menu => menu.status === "archivada");
      setArchivedMenus(onlyArchived);
    }
  }, [menus]);

  // Aplicar filtro de búsqueda
  const filteredArchivedMenus = archivedMenus.filter(menu => 
    searchTerm.trim() === "" || 
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 w-full sm:w-72">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar menús archivados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {loading && <div className="text-center py-4">Cargando menús archivados...</div>}

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-destructive mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && filteredArchivedMenus.length === 0 && (
        <div className="flex justify-center items-center p-8">
          <p className="text-muted-foreground">No hay menús archivados disponibles</p>
        </div>
      )}

      {!loading && filteredArchivedMenus.length > 0 && (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Fecha de validez
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Fecha de archivado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArchivedMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{menu.name}</div>
                      {menu.description && (
                        <div className="text-xs text-muted-foreground">
                          {menu.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {menu.valid_date ? (
                        formatDate(menu.valid_date)
                      ) : (
                        <span className="text-muted-foreground">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {menu.updated_at ? (
                        formatDate(menu.updated_at)
                      ) : (
                        <span className="text-muted-foreground">Desconocida</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
