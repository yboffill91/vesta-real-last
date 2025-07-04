"use client";

import { useState, useEffect } from "react";
import { Product } from "@/models/product";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
// Eliminamos el import del checkbox ya que no lo usaremos más

interface ProductSelectionListProps {
  products: Product[];
  productCategories: Map<number, any>;
  selectedProductIds: number[];
  onProductSelectionChange: (productIds: number[]) => void;
  loading: boolean;
  // Lista de productos que ya están en confirmación o en el menú
  alreadySelectedProducts?: Product[];
}

export function ProductSelectionList({
  products,
  productCategories,
  loading,
  selectedProductIds,
  onProductSelectionChange,
  alreadySelectedProducts = [],
}: ProductSelectionListProps) {
  // Estado local
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar productos  // Filtro por categoría, término de búsqueda y productos ya seleccionados
  useEffect(() => {
    if (loading) return;

    let filtered = [...products];
    
    // Excluir productos que ya están en la tabla de confirmación o en el menú
    const alreadySelectedIds = alreadySelectedProducts.map(p => p.id);
    filtered = filtered.filter(product => !alreadySelectedIds.includes(product.id));

    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === Number(selectedCategory)
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, alreadySelectedProducts]);

  // Manejar selección de producto (ahora es un toggle al hacer click en la fila)
  const handleProductSelect = (productId: number) => {
    // Si ya está seleccionado, lo quitamos
    if (selectedProductIds.includes(productId)) {
      onProductSelectionChange(
        selectedProductIds.filter((id) => id !== productId)
      );
    } else {
      // Si no está seleccionado, lo añadimos
      onProductSelectionChange([...selectedProductIds, productId]);
    }
  };

  // Generar opciones de categorías para el select
  const categoryOptions = () => {
    const categories = Array.from(productCategories.values());
    return categories.map((category) => (
      <SelectItem key={category.id} value={String(category.id)}>
        {category.name}
      </SelectItem>
    ));
  };

  return (
    <div className="border rounded-md p-4 shadow-sm bg-card mb-4">
      <h3 className="text-lg font-medium mb-4">Productos disponibles</h3>

      <div className="mb-12 flex items-center justify-evenly w-full">
        {/* Filtro por categoría */}
        <div className="w-1/3">
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium mb-1"
          >
            Filtrar por categoría
          </label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger id="category-filter" className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categoryOptions()}
            </SelectContent>
          </Select>
        </div>

        {/* Búsqueda por nombre */}
        <div className="w-1/3">
          <label
            htmlFor="product-search"
            className="block text-sm font-medium mb-1"
          >
            Buscar producto
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="product-search"
              placeholder="Nombre del producto"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de productos con checkboxes */}
      <div className="overflow-y-auto max-h-80 border rounded">
        {loading ? (
          <div className="p-4 text-center">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No se encontraron productos que coincidan con los filtros
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-2 w-12"></th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Categoría</th>
                <th className="p-2 text-right">Precio base</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const categoryName = product.category_id
                  ? productCategories.get(product.category_id)?.name ||
                    "Sin categoría"
                  : "Sin categoría";

                return (
                  <tr
                    key={product.id}
                    className={`border-b hover:bg-secondary/15 ${
                      isSelected ? "bg-secondary/15" : ""
                    } cursor-pointer`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <td className="p-2 text-center">
                      <div className="w-4 h-4 mx-auto rounded-full bg-primary/20 relative">
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{categoryName}</td>
                    <td className="p-2 text-right">
                      ${product.price?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
