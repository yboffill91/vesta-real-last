"use client";

import { useState } from "react";
import { MenuItem } from "@/models/menu";
import { Button, RootInput } from "@/components/ui";
import { Trash, Edit2, Save, X } from "lucide-react";

interface MenuProductsTableProps {
  menuItems: MenuItem[];
  onUpdatePrice: (itemId: number, newPrice: number) => Promise<void>;
  onDelete: (itemId: number) => void;
}

export function MenuProductsTable({ 
  menuItems, 
  onUpdatePrice, 
  onDelete 
}: MenuProductsTableProps) {
  // Estado para edición
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Iniciar edición de precio
  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditPrice(item.price.toString());
  };

  // Guardar cambio de precio
  const handleSaveEdit = async (itemId: number) => {
    if (!editPrice || Number(editPrice) <= 0) {
      setError("Ingresa un precio válido mayor a 0");
      return;
    }

    setLoading(true);
    try {
      await onUpdatePrice(itemId, Number(editPrice));
      setSuccess("Precio actualizado correctamente");
      setEditingItemId(null);
      setEditPrice("");

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al actualizar el precio");
      // Limpiar mensaje de error después de 3 segundos
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditPrice("");
    setError(null);
  };

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Este menú aún no tiene productos asignados
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2">Producto</th>
              <th className="text-left p-2">Categoría</th>
              <th className="text-right p-2">Precio</th>
              <th className="text-center p-2">Disponible</th>
              <th className="text-right p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/30">
                <td className="p-2">{item.product_name}</td>
                <td className="p-2 text-sm">
                  {item.category_name || "Sin categoría"}
                </td>
                <td className="p-2 text-right">
                  {editingItemId === item.id ? (
                    <div className="flex items-center justify-end">
                      <RootInput 
                        id={`edit-item-price-${item.id}`}
                        htmlFor={`edit-item-price-${item.id}`}
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
                        disabled={loading}
                        onClick={() => handleSaveEdit(item.id)}
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
                    <>${item.price.toFixed(2)}</>
                  )}
                </td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs inline-block
                    ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.is_available ? "Sí" : "No"}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <div className="flex justify-end space-x-2">
                    {editingItemId !== item.id && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStartEdit(item)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(item.id)}
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
      {error && (
        <div className="mt-3 text-destructive text-sm">{error}</div>
      )}
      {success && (
        <div className="mt-3 text-green-600 text-sm">{success}</div>
      )}
    </div>
  );
}
