"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/models/product";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Buttons";
import { RootInput } from "@/components/ui/root-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/Select";
import { SystemAlert } from "@/components/ui/system-alert";
import { Pencil, Trash, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Separator } from "@/components/ui/Separator";
import { ToggleButton } from "@/components/ui/ToggleButton";

export const ProductTable = () => {
  const {
    products,
    productCategories,
    loading: productsLoading,
    fetchProducts,
    updateProductAvailability,
    deleteProduct,
    getCategoryForProduct,
    error,
  } = useProducts();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  // Estado para filtros
  const [nameFilter, setNameFilter] = useState("");
  const [availableFilter, setAvailableFilter] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Cargar productos solo una vez al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Eliminar duplicados si existieran y sincronizar con filteredProducts
  useEffect(() => {
    if (products && Array.isArray(products)) {
      setFilteredProducts(products);
      console.log("Productos cargados:", products.length);
    }
  }, [products]);

  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Filtro por nombre
    if (nameFilter.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Filtro por disponibilidad
    if (availableFilter !== "all") {
      const isAvailable = availableFilter === "available";
      filtered = filtered.filter(
        (product) => product.is_available === isAvailable
      );
    }

    setFilteredProducts(filtered);
  }, [nameFilter, availableFilter, products]);

  // Función para confirmar eliminación
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  // Función para confirmar el cambio de disponibilidad
  const handleAvailabilityToggle = async (
    id: number,
    currentValue: boolean
  ) => {
    try {
      await updateProductAvailability(id, { is_available: !currentValue });
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
    }
  };

  // Función para eliminar producto
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteProduct(deleteId);
      if (success) {
        setShowConfirmDelete(false);
        setDeleteId(null);
      } else {
        setDeleteError("No se pudo eliminar el producto");
      }
    } catch (error: any) {
      setDeleteError(error.message || "Error al eliminar el producto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">
            Buscar por nombre
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar producto..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1 block">Estado</label>
          <Select value={availableFilter} onValueChange={setAvailableFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="unavailable">No disponibles</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SystemAlert
        open={showConfirmDelete}
        setOpen={setShowConfirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer."
        variant="destructive"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {productsLoading && (
        <div className="text-center py-4">Cargando productos...</div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-destructive mb-4">
          Error: {error}
        </div>
      )}

      {!productsLoading && !error && filteredProducts.length === 0 && (
        <div className="flex justify-center items-center p-8">
          <p className="text-muted-foreground">No hay productos disponibles</p>
        </div>
      )}

      {!productsLoading && filteredProducts.length > 0 && (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Nombre
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Precio
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm flex flex-col leading-tight">
                      <h3 className="text-lg font-medium"> {product.name} </h3>
                      <h4 className="text-sm font-thin text-muted-foreground">
                        {product.category_id
                          ? getCategoryForProduct(product.category_id)?.name ||
                            product.category_name ||
                            "Sin Categoría"
                          : "Sin Categoría"}
                      </h4>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-center items-center gap-2">
                        <ToggleButton
                          checked={product.is_available}
                          onCheckedChange={() =>
                            handleAvailabilityToggle(
                              product.id,
                              product.is_available
                            )
                          }
                          activeIcon={<ToggleRight />}
                          inactiveIcon={<ToggleLeft />}
                          className="size-8"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/products/edit/${product.id}`
                            )
                          }
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(product.id)}
                          title="Eliminar"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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
