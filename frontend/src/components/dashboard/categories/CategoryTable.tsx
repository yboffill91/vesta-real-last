"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { DashboardCards } from "@/components/ui";
import { Loader2, PlusCircle, Edit, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/Buttons";
import { useRouter } from "next/navigation";
import { SystemAlert } from "@/components/ui/system-alert";
import { RootInput } from "@/components/ui/root-input";
import { Category } from "@/models/category";

export const CategoryTable = () => {
  const { categories, loading, error, fetchCategories, deleteCategory } =
    useCategories();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  // Estado para filtros
  const [nameFilter, setNameFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  // Cargar categorías solo una vez al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Eliminar duplicados por nombre y sincronizar con filteredCategories
  useEffect(() => {
    if (categories && Array.isArray(categories)) {
      // Creamos un Map para eliminar duplicados por nombre
      const uniqueCategories = Array.from(
        new Map(categories.map(cat => [cat.name, cat])).values()
      );
      console.log('Categorías únicas:', uniqueCategories.length, 'de', categories.length, 'originales');
      setFilteredCategories(uniqueCategories);
    }
  }, [categories]);

  // Aplicar filtros
  useEffect(() => {
    if (!categories.length) return;

    let filtered = [...categories];

    // Filtrar por nombre
    if (nameFilter.trim()) {
      const searchTerm = nameFilter.toLowerCase().trim();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm) ||
          (cat.description &&
            cat.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtrar por estado activo/inactivo
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      filtered = filtered.filter((cat) => cat.is_active === isActive);
    }

    setFilteredCategories(filtered);
  }, [nameFilter, activeFilter, categories]);

  // Manejar eliminación
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteCategory(deleteId);
      if (success) {
        setShowConfirmDelete(false);
        setDeleteId(null);
      } else {
        setDeleteError("No se pudo eliminar la categoría");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Error al eliminar la categoría");
    } finally {
      setDeleting(false);
    }
  };

  // Ir a editar categoría
  const handleEdit = (id: number) => {
    router.push(`/dashboard/products/categories/edit/${id}`);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setNameFilter("");
    setActiveFilter("all");
  };

  if (loading && !categories.length) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-destructive">Error: {error}</div>
    );
  }

  return (
    <>
      <SystemAlert
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro que desea eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="destructive"
      />

      {deleteError && (
        <SystemAlert
          open={!!deleteError}
          setOpen={() => setDeleteError(null)}
          title="Error al eliminar"
          description={deleteError}
          confirmText="Aceptar"
          variant="destructive"
        />
      )}

      <DashboardCards title="Categorías de Productos" icon={Layers}>
        {/* Filtros */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <RootInput
              label="Buscar por nombre"
              htmlFor="name-filter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
              type="text"
              placeholder="Nombre de la categoría..."
            />
          </div>

          {/* Botón para añadir categoría */}
          <div>
            <Button
              onClick={() => router.push("/dashboard/products/categories/add")}
              className="flex gap-2 items-center"
              variant="default"
            >
              <PlusCircle size={16} />
              Añadir
            </Button>
          </div>
        </div>

        {/* Contador de resultados y botón para limpiar filtros */}
        {(nameFilter || activeFilter !== "all") && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {filteredCategories.length} de {categories.length}{" "}
              categorías
            </span>
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay categorías creadas
            </p>
            <Button
              onClick={() => router.push("/dashboard/products/categories/add")}
              className="flex gap-2 items-center mx-auto"
            >
              <PlusCircle size={16} />
              Crear primera categoría
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No se encontraron categorías que coincidan con los filtros
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {category.description || (
                        <span className="text-muted-foreground italic">
                          Sin descripción
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          category.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(category.id);
                            setShowConfirmDelete(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCards>
    </>
  );
};
