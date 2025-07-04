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
import { Pencil, Trash, Search, Archive, CheckCircle, Copy } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Función para formatear fechas sin dependencias externas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const MenuTable = () => {
  const {
    menus,
    loading,
    fetchMenus,
    deleteMenu,
    publishMenu,
    archiveMenu,
    duplicateMenu,
    error,
  } = useMenus();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados para confirmación de publicación y archivado
  const [publishId, setPublishId] = useState<number | null>(null);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Estados para duplicación de menú
  const [duplicateId, setDuplicateId] = useState<number | null>(null);
  const [showConfirmDuplicate, setShowConfirmDuplicate] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string>("");

  const router = useRouter();

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAllMenus, setShowAllMenus] = useState<boolean>(true);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);

  // Cargar menús al montar el componente
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar filteredMenus cuando cambian los menús
  useEffect(() => {
    if (menus && Array.isArray(menus)) {
      setFilteredMenus(menus);
    }
  }, [menus]);

  // Aplicar filtros
  useEffect(() => {
    if (!menus.length) return;

    let filtered = [...menus];

    // Filtro por nombre
    if (searchTerm.trim()) {
      filtered = filtered.filter((menu) =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((menu) => menu.status === statusFilter);
    }

    setFilteredMenus(filtered);
  }, [searchTerm, statusFilter, menus]);

  // Preparar eliminación de menú
  const prepareDeleteMenu = (id: number) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  // Confirmar eliminación de menú
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteMenu(deleteId);
      // No es necesario actualizar el estado local porque fetchMenus se encargará de esto
    } catch (err: any) {
      setDeleteError(err?.message || "Error al eliminar el menú");
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
      setDeleteId(null);
    }
  };

  // Preparar publicación de menú
  const preparePublishMenu = (id: number) => {
    setPublishId(id);
    setShowConfirmPublish(true);
  };

  // Confirmar publicación de menú
  const handlePublishConfirm = async () => {
    if (!publishId) return;

    setPublishing(true);
    setStatusUpdateMessage(null);
    try {
      const success = await publishMenu(publishId);

      if (success) {
        setStatusUpdateMessage({
          type: "success",
          text: "Menú publicado exitosamente",
        });
        // @ts-ignore: Estamos usando la versión actualizada de fetchMenus
        fetchMenus();
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: "Error al publicar el menú",
        });
      }
    } catch (err: any) {
      setStatusUpdateMessage({
        type: "error",
        text: `Error al publicar el menú: ${
          err.message || "Error desconocido"
        }`,
      });
    } finally {
      setPublishing(false);
      setShowConfirmPublish(false);
      setPublishId(null);

      // Auto-ocultar el mensaje después de 5 segundos
      setTimeout(() => setStatusUpdateMessage(null), 5000);
    }
  };

  // Preparar archivado de menú
  const prepareArchiveMenu = (id: number) => {
    setArchiveId(id);
    setShowConfirmArchive(true);
  };

  // Confirmar archivado de menú
  const handleArchiveConfirm = async () => {
    if (!archiveId) return;

    setArchiving(true);
    setStatusUpdateMessage(null);
    try {
      const success = await archiveMenu(archiveId);

      if (success) {
        setStatusUpdateMessage({
          type: "success",
          text: "Menú archivado exitosamente",
        });
        // @ts-ignore: Estamos usando la versión actualizada de fetchMenus
        fetchMenus();
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: "Error al archivar el menú",
        });
      }
    } catch (err: any) {
      setStatusUpdateMessage({
        type: "error",
        text: `Error al archivar el menú: ${
          err.message || "Error desconocido"
        }`,
      });
    } finally {
      setArchiving(false);
      setShowConfirmArchive(false);
      setArchiveId(null);

      // Auto-ocultar el mensaje después de 5 segundos
      setTimeout(() => setStatusUpdateMessage(null), 5000);
    }
  };

  // Preparar duplicación de menú
  const prepareDuplicateMenu = (id: number, name: string) => {
    setDuplicateId(id);
    setDuplicateName(name + " (Copia)"); // Nombre predeterminado
    setShowConfirmDuplicate(true);
  };

  // Confirmar duplicación de menú
  const handleDuplicateConfirm = async () => {
    if (!duplicateId) return;

    setDuplicating(true);
    setStatusUpdateMessage(null);
    try {
      const duplicatedMenu = await duplicateMenu(duplicateId, duplicateName);

      if (duplicatedMenu) {
        setStatusUpdateMessage({
          type: "success",
          text: "Menú duplicado con éxito",
        });

        // Actualizar la lista de menús
        fetchMenus();
      } else {
        setStatusUpdateMessage({
          type: "error",
          text: "Error al duplicar el menú",
        });
      }
    } catch (err: any) {
      setStatusUpdateMessage({
        type: "error",
        text: err?.message || "Error al duplicar el menú",
      });
    } finally {
      setDuplicating(false);
      setShowConfirmDuplicate(false);
      setDuplicateId(null);
      setDuplicateName("");
    }
  };

  // Función para publicar menú
  const handlePublishMenu = async (id: number) => {
    preparePublishMenu(id);
  };

  // Función para archivar menú
  const handleArchiveMenu = async (id: number) => {
    prepareArchiveMenu(id);
  };

  // Obtiene el color de badge según estado
  const getStatusBadgeClass = (status: MenuStatus) => {
    switch (status) {
      case "borrador":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "publicada":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "archivada":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

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
                    placeholder="Buscar menús..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
              </div>

              {/* <div className="flex items-center space-x-2">
                <label className="text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllMenus}
                    onChange={(e) => setShowAllMenus(e.target.checked)}
                    className="mr-2"
                  />
                  Mostrar todos los menús (incluye borradores)
                </label>
              </div> */}
            </div>
          </label>
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
                <SelectItem value="archivada">Archivada</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar menú */}
      <SystemAlert
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este menú? Esta acción no se puede deshacer."
        variant="destructive"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {/* Diálogo de confirmación para publicar menú */}
      <SystemAlert
        open={showConfirmPublish}
        setOpen={setShowConfirmPublish}
        title="Publicar menú"
        description="¿Está seguro de que desea publicar este menú? Una vez publicado, no podrá modificarlo, solo archivarlo."
        variant="default"
        confirmText="Publicar"
        cancelText="Cancelar"
        onConfirm={handlePublishConfirm}
        onCancel={() => setShowConfirmPublish(false)}
      />

      {/* Diálogo de confirmación para archivar menú */}
      <SystemAlert
        open={showConfirmArchive}
        setOpen={setShowConfirmArchive}
        title="Archivar menú"
        description="¿Está seguro de que desea archivar este menú? Una vez archivado, no podrá modificarlo ni volver a publicarlo."
        variant="default"
        confirmText="Archivar"
        cancelText="Cancelar"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowConfirmArchive(false)}
      />

      {/* Diálogo para duplicar menú */}
      <AlertDialog open={showConfirmDuplicate} onOpenChange={setShowConfirmDuplicate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicar Menú</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una copia del menú con todos sus productos. Ingresa un nombre para el nuevo menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Nombre del nuevo menú"
              className="w-full"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={duplicating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDuplicateConfirm}
              disabled={duplicating || !duplicateName.trim()}
            >
              {duplicating ? "Duplicando..." : "Duplicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading && <div className="text-center py-4">Cargando menús...</div>}

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-destructive mb-4">
          Error: {error}
        </div>
      )}

      {statusUpdateMessage && (
        <div
          className={`rounded-md p-3 mb-4 ${
            statusUpdateMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {statusUpdateMessage.text}
        </div>
      )}

      {!loading && !error && filteredMenus.length === 0 && (
        <div className="flex justify-center items-center p-8">
          <p className="text-muted-foreground">No hay menús disponibles</p>
        </div>
      )}

      {!loading && filteredMenus.length > 0 && (
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
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMenus.map((menu) => (
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
                      <span
                        className={`inline-block py-1 px-2 rounded-md text-sm ${getStatusBadgeClass(
                          menu.status
                        )}`}
                      >
                        {menu.status === "borrador"
                          ? "Borrador"
                          : menu.status === "publicada"
                          ? "Publicada"
                          : "Archivada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-end items-center gap-2">
                        {/* Botón publicar (solo si está en borrador) */}
                        {menu.status === "borrador" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePublishMenu(menu.id)}
                            title="Publicar"
                            disabled={publishing && publishId === menu.id}
                          >
                            {publishing && publishId === menu.id ? (
                              <span className="animate-pulse">
                                Publicando...
                              </span>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {/* Botón archivar (solo si está publicado) */}
                        {menu.status === "publicada" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleArchiveMenu(menu.id)}
                            title="Archivar"
                            disabled={archiving && archiveId === menu.id}
                          >
                            {archiving && archiveId === menu.id ? (
                              <span className="animate-pulse">
                                Archivando...
                              </span>
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {/* Botón editar (solo para borradores) */}
                        {menu.status === "borrador" && (
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
                        )}

                        {/* Botón duplicar (para todos los menús) */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prepareDuplicateMenu(menu.id, menu.name)}
                          title="Duplicar Menú"
                          disabled={duplicating && duplicateId === menu.id}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {/* Botón asignar productos */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/menus/${menu.id}/products`)
                          }
                          title="Asignar Productos"
                        >
                          Productos
                        </Button>

                        {/* Botón eliminar (solo para borradores) */}
                        {menu.status === "borrador" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => prepareDeleteMenu(menu.id)}
                            title="Eliminar"
                            disabled={
                              menu.status !== "borrador" ||
                              (deleting && deleteId === menu.id)
                            }
                          >
                            {deleting && deleteId === menu.id ? (
                              <span className="animate-pulse">
                                Eliminando...
                              </span>
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
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
