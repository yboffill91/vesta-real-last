"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMenus } from "@/hooks/useMenus";
import { Menu, MenuStatus } from "@/models/menu";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/Select";
import { SystemAlert } from "@/components/ui/system-alert";
import {
  Pencil,
  Trash,
  Search,
  Archive,
  CheckCircle,
  Plus,
  Package,
  ShoppingBag,
  CirclePlus,
  Eye,
} from "lucide-react";

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

interface MenuTableProps {
  initialStatusFilter?: string | string[];
}

export const MenuTable = ({
  initialStatusFilter = "all",
}: MenuTableProps = {}) => {
  const {
    menus,
    loading,
    fetchMenus,
    deleteMenu,
    publishMenu,
    archiveMenu,
    error,
    getMenuWithItems,
  } = useMenus();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [publishId, setPublishId] = useState<number | null>(null);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    typeof initialStatusFilter === "string" ? initialStatusFilter : "all"
  );
  // Eliminamos el estado showAllMenus ya que no se está usando correctamente
  const [filteredMenus, setFilteredMenus] = useState<
    (Menu & { items?: { id: number }[] })[]
  >([]);

  // Eliminado - Ya está incluido en el efecto principal

  // Carga inicial de menús
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Efecto para cargar menús con items y aplicar filtros
  useEffect(() => {
    if (menus && Array.isArray(menus)) {
      // Primero filtrar menús activos (no archivados)
      const activeMenus = menus.filter(
        (menu) => menu.status === "borrador" || menu.status === "publicada"
      );

      // Luego cargar los items y aplicar filtros adicionales
      const loadMenuItems = async () => {
        try {
          const menusWithItems = await Promise.all(
            activeMenus.map(async (menu) => {
              try {
                const menuWithItems = await getMenuWithItems(menu.id);
                return menuWithItems || menu;
              } catch (error) {
                console.error(
                  `Error al cargar items para menú ${menu.id}:`,
                  error
                );
                return menu;
              }
            })
          );

          // Aplicar filtros adicionales (búsqueda y estado)
          let filtered = [...menusWithItems];

          if (searchTerm.trim()) {
            filtered = filtered.filter((menu) =>
              menu.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (statusFilter !== "all") {
            filtered = filtered.filter((menu) => menu.status === statusFilter);
          }

          setFilteredMenus(filtered);
        } catch (error) {
          console.error("Error al cargar items de menús:", error);
        }
      };

      loadMenuItems();
    } else {
      setFilteredMenus([]);
    }
  }, [menus, getMenuWithItems, searchTerm, statusFilter]);

  // Efecto para actualizar el filtro de estado cuando cambia initialStatusFilter
  useEffect(() => {
    if (typeof initialStatusFilter === "string") {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const prepareDeleteMenu = (id: number) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteMenu(deleteId);
    } catch (err: any) {
      setDeleteError(err?.message || "Error al eliminar el menú");
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
      setDeleteId(null);
    }
  };

  const handlePublishMenu = async (
    menu: Menu & { items?: { id: number }[] }
  ) => {
    try {
      if (!menu.items || menu.items.length === 0) {
        setStatusUpdateMessage({
          text: `No se puede publicar el menú "${menu.name}" porque no tiene productos asignados.`,
          type: "error",
        });
        return;
      }

      setPublishId(menu.id);
      setPublishing(true);
      await publishMenu(menu.id);
      // Recargar menús después de la publicación
      await fetchMenus();
      setStatusUpdateMessage({
        text: `El menú "${menu.name}" ha sido publicado con éxito.`,
        type: "success",
      });
    } catch (error) {
      setStatusUpdateMessage({
        text: `Error al publicar el menú: ${error}`,
        type: "error",
      });
    } finally {
      setPublishing(false);
      setTimeout(() => setStatusUpdateMessage(null), 5000);
    }
  };

  const prepareArchiveMenu = (id: number) => {
    setArchiveId(id);
    setShowConfirmArchive(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveId) return;
    setArchiving(true);
    try {
      const success = await archiveMenu(archiveId);
      if (success) {
        setStatusUpdateMessage({
          type: "success",
          text: "Menú archivado exitosamente",
        });
        fetchMenus();
      } else {
        throw new Error("Error al archivar");
      }
    } catch (err: any) {
      setStatusUpdateMessage({
        type: "error",
        text: `Error al archivar el menú: ${err.message || "Desconocido"}`,
      });
    } finally {
      setArchiving(false);
      setShowConfirmArchive(false);
      setArchiveId(null);
      setTimeout(() => setStatusUpdateMessage(null), 5000);
    }
  };

  const getStatusBadgeClass = (status: MenuStatus) => {
    switch (status) {
      case "borrador":
        return "text-yellow-500 italic bg-yellow-500/5 rounded-lg";
      case "publicada":
        return "bg-secondary/5 text-secondary italic rounded-lg";
      case "archivada":
        return "bg-destructive/5 text-destructive italic rounded-lg";
      default:
        return "bg-primary/5 text-primary italic rounded-lg";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <div className="mb-4 border p-2 rounded-md bg-muted flex items-end gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar menús..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="publicada">Publicada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de sistema */}
      <SystemAlert
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este menú?"
        variant="destructive"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmDelete(false)}
      />

      <SystemAlert
        open={showConfirmArchive}
        setOpen={setShowConfirmArchive}
        title="Archivar menú"
        description="¿Está seguro de que desea archivar este menú?"
        variant="default"
        confirmText="Archivar"
        cancelText="Cancelar"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowConfirmArchive(false)}
      />

      {/* Mensajes */}
      {statusUpdateMessage && (
        <div
          className={`rounded-md p-3 ${
            statusUpdateMessage.type === "success"
              ? "bg-secondary text-secondary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {statusUpdateMessage.text}
        </div>
      )}

      {loading && <div className="text-center py-4">Cargando menús...</div>}

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-destructive mb-4">
          Error: {error}
        </div>
      )}

      {!loading && filteredMenus.length === 0 && (
        <div className="flex justify-center items-center p-8 border rounded-md bg-muted/50">
          <p className="text-muted-foreground">No hay menús disponibles</p>
        </div>
      )}

      {/* Tabla - solo se muestra si hay menús */}
      {!loading && filteredMenus.length > 0 && (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Fecha de validez
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-primary/5 ">
                    <td className="px-4 py-3">
                      <div className="font-medium">{menu.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {menu.description}
                        <span
                          className={` inline-block py-0.5 px-1 text-[0.6rem] ${getStatusBadgeClass(
                            menu.status
                          )}`}
                        >
                          {menu.status.charAt(0).toUpperCase() +
                            menu.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {menu.valid_date ? (
                        formatDate(menu.valid_date)
                      ) : (
                        <span className="text-muted-foreground">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex  items-center justify-end gap-2 ">
                      {menu.status === "borrador" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/menus/edit/${menu.id}`)
                            }
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => prepareDeleteMenu(menu.id)}
                            title="Eliminar"
                            disabled={deleting && deleteId === menu.id}
                          >
                            {deleting && deleteId === menu.id ? (
                              "Eliminando..."
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishMenu(menu)}
                            disabled={
                              publishing ||
                              !menu.items ||
                              menu.items.length === 0
                            }
                            title={
                              !menu.items || menu.items.length === 0
                                ? "No se puede publicar un menú sin productos"
                                : "Publicar"
                            }
                          >
                            {publishing && publishId === menu.id ? (
                              "Publicando..."
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {menu.status === "publicada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prepareArchiveMenu(menu.id)}
                          title="Archivar"
                          disabled={archiving && archiveId === menu.id}
                        >
                          {archiving && archiveId === menu.id ? (
                            "Archivando..."
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {menu.status !== "archivada" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/menus/${menu.id}/products`)
                          }
                          title="Ver - Asignar Productos productos"
                        >
                          <Eye className="w-6 h-6" />
                        </Button>
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
