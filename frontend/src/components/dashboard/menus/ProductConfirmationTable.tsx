"use client";

import { useState } from "react";
import { Product } from "@/models/product";
import { Button, RootInput } from "@/components/ui";
import { SystemAlert } from "@/components/ui/system-alert";
import { Trash, Edit2, Save, X, Check } from "lucide-react";

export interface PendingMenuItem {
  product: Product;
  price: string;
  is_available: boolean;
}

interface ProductConfirmationTableProps {
  pendingItems: PendingMenuItem[];
  productCategories: Map<number, any>;
  onConfirmAll: () => void;
  onRemove: (index: number) => void;
  onUpdatePrice: (index: number, newPrice: string) => void;
  onToggleAvailability: (index: number) => void;
  loading: boolean;
  success?: string | null;
  error?: string | null;
}

export function ProductConfirmationTable({
  pendingItems,
  productCategories,
  onConfirmAll,
  onRemove,
  onUpdatePrice,
  onToggleAvailability,
  loading,
  success,
  error,
}: ProductConfirmationTableProps) {
  // Estado para edición
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  // Iniciar edición de precio
  const handleStartEdit = (index: number) => {
    setEditingItemIndex(index);
    setEditPrice(pendingItems[index].price);
  };

  // Guardar cambio de precio
  const handleSaveEdit = (index: number) => {
    if (!editPrice || Number(editPrice) <= 0) {
      // Mostrar error local o usar un callback para error
      return;
    }

    onUpdatePrice(index, editPrice);
    setEditingItemIndex(null);
    setEditPrice("");
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingItemIndex(null);
    setEditPrice("");
  };

  // Obtener nombre de la categoría
  const getCategoryName = (categoryId: number | undefined | null): string => {
    if (!categoryId) return "Sin categoría";
    return productCategories.get(categoryId)?.name || "Sin categoría";
  };

  if (pendingItems.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-4 shadow-sm bg-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Productos seleccionados ({pendingItems.length})
        </h3>
        <Button
          onClick={onConfirmAll}
          disabled={loading || pendingItems.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2" size={16} />
          Confirmar todos
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/15">
            <tr>
              <th className="py-2 px-3 text-left">Producto</th>
              <th className="py-2 px-3 text-left">Categoría</th>
              <th className="py-2 px-3 text-left">Precio</th>
              <th className="py-2 px-3 text-left">Estado</th>
              <th className="py-2 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pendingItems.map((item, index) => (
              <tr
                key={`pending-${item.product.id}`}
                className="hover:bg-secondary/15"
              >
                <td className="py-2 px-3">{item.product.name}</td>
                <td className="py-2 px-3">
                  {getCategoryName(item.product.category_id)}
                </td>
                <td className="py-2 px-3">
                  {editingItemIndex === index ? (
                    <div className="flex items-center">
                      <RootInput
                        id={`edit-price-${index}`}
                        htmlFor={`edit-price-${index}`}
                        label=""
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 mr-2"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="mr-1"
                        onClick={() => handleSaveEdit(index)}
                      >
                        <Save size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <span>${Number(item.price).toFixed(2)}</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div
                    className={`px-2 py-1 rounded-full text-xs cursor-pointer
                      ${
                        item.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    onClick={() => onToggleAvailability(index)}
                  >
                    {item.is_available ? "Disponible" : "No disponible"}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-center space-x-2">
                    {editingItemIndex !== index && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(index)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(index)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensajes de estado */}
      {error && <div className="mt-3 text-destructive text-sm">{error}</div>}
      {success && <div className="mt-3 text-green-600 text-sm">{success}</div>}
    </div>
  );
}
