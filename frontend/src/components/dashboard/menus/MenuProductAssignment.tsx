"use client";

import React, { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useMenus } from "@/hooks/useMenus";
import { Menu, MenuItem } from "@/models/menu";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SystemAlert } from "@/components/ui/system-alert";
import { Check, AlertCircle } from "lucide-react";

// Import the subcomponents
import { ProductSelectionList } from "./ProductSelectionList";
import { ProductConfirmationTable, PendingMenuItem } from "./ProductConfirmationTable";
import { MenuProductsTable } from "./MenuProductsTable";

interface MenuProductAssignmentProps {
  menu: Menu & { items?: MenuItem[] };
}

export function MenuProductAssignment({ menu }: MenuProductAssignmentProps) {
  // Hooks para productos y menús
  const {
    products,
    productCategories,
    loading: productsLoading,
    fetchProducts,
  } = useProducts();
  const { addMenuItem, removeMenuItem, updateMenuItem } = useMenus();
  
  // Estados principales
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingMenuItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Estados de feedback y UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para diálogos
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState("");

  // Cargar productos y actualizar menuItems cuando cambia el menú
  useEffect(() => {
    fetchProducts();
    // Verificar si el menú tiene items y asignarlos al estado
    if (menu && menu.items) {
      setMenuItems(menu.items);
    }
  }, [fetchProducts, menu]);

  // Manejador para cuando cambia la selección de productos
  const handleProductSelectionChange = (productIds: number[]) => {
    setSelectedProductIds(productIds);
  };

  // Efecto para actualizar pendingItems cuando cambie selectedProductIds
  useEffect(() => {
    // Filtrar los productos seleccionados
    const selectedProducts = products.filter(product => 
      selectedProductIds.includes(product.id)
    );
    
    // Crear los nuevos pendingItems (evitando duplicados)
    const newPendingItems = selectedProducts.map(product => ({
      product,
      price: product.price?.toString() || "0",
      is_available: true
    }));
    
    // Solo actualizar si hay cambios
    if (selectedProductIds.length > 0) {
      // Para evitar un loop infinito, hacemos una comparación previa en memoria
      // y solo actualizamos si realmente hay cambios
      const currentIds = pendingItems.map(item => item.product.id).sort().join(',');
      const newIds = newPendingItems.map(item => item.product.id).sort().join(',');
      
      if (currentIds !== newIds) {
        // Mantener los pendingItems existentes (para conservar ediciones)
        // pero solo si siguen en selectedProductIds
        const filteredPending = pendingItems.filter(item => 
          selectedProductIds.includes(item.product.id)
        );
        
        // Añadir solo los nuevos productos que no están ya en pendingItems
        const pendingProductIds = filteredPending.map(item => item.product.id);
        const itemsToAdd = newPendingItems.filter(item => 
          !pendingProductIds.includes(item.product.id)
        );
        
        setPendingItems([...filteredPending, ...itemsToAdd]);
      }
    } else if (pendingItems.length > 0) {
      // Solo vaciar si hay items (evita actualizaciones innecesarias)
      setPendingItems([]);
    }
    // Eliminamos pendingItems de las dependencias para evitar el loop infinito
  }, [selectedProductIds, products]);
  
  // Manejadores para ProductConfirmationTable
  const handleConfirmAllProducts = async () => {
    if (pendingItems.length === 0) {
      setError("No hay productos pendientes para agregar");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    let successCount = 0;

    try {
      for (const item of pendingItems) {
        await addMenuItem(menu.id, {
          product_id: item.product.id,
          price: parseFloat(item.price),
          is_available: item.is_available,
        });
        successCount++;
      }

      // Mostrar mensaje de éxito con diálogo
      setAlertMessage(`Se agregaron ${successCount} productos al menú exitosamente.`);
      setShowSuccessDialog(true);

      // Actualizar los items del menú desde la respuesta
      // Esto deberíamos hacerlo con una consulta fresca, pero por simplicidad
      // asumimos que los items se agregaron correctamente
      const newItems = pendingItems.map(item => ({
        id: Date.now() + item.product.id, // Este ID es temporal, debería venir del backend
        menu_id: menu.id,
        product_id: item.product.id,
        product_name: item.product.name,
        category_id: item.product.category_id,
        category_name: item.product.category_id ? 
          productCategories.get(item.product.category_id)?.name || "Sin categoría" : 
          "Sin categoría",
        price: parseFloat(item.price),
        is_available: item.is_available
      }));
      
      setMenuItems([...menuItems, ...newItems]);

      // Limpiar pendientes y selecciones
      setPendingItems([]);
      setSelectedProductIds([]);
    } catch (err) {
      setAlertMessage("Ocurrió un error al agregar los productos al menú.");
      setShowErrorDialog(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePendingItem = (index: number) => {
    // Eliminar de pendingItems
    const updatedItems = [...pendingItems];
    const removedProductId = updatedItems[index].product.id;

    // Eliminar de pendingItems
    updatedItems.splice(index, 1);
    setPendingItems(updatedItems);

    // Eliminar de selectedProductIds
    setSelectedProductIds(selectedProductIds.filter(id => id !== removedProductId));
  };

  const handleUpdatePendingPrice = (index: number, newPrice: string) => {
    const updatedItems = [...pendingItems];
    updatedItems[index].price = newPrice;
    setPendingItems(updatedItems);
  };

  const handleTogglePendingAvailability = (index: number) => {
    const updatedItems = [...pendingItems];
    updatedItems[index].is_available = !updatedItems[index].is_available;
    setPendingItems(updatedItems);
  };

  // Manejadores para MenuProductsTable
  const handleUpdateMenuItemPrice = async (itemId: number, newPrice: number) => {
    setLoading(true);
    try {
      // Llamar al endpoint para actualizar el precio
      await updateMenuItem(menu.id, itemId, { price: newPrice });
      
      // Actualizar el estado local
      setMenuItems(menuItems.map(item => 
        item.id === itemId ? { ...item, price: newPrice } : item
      ));
      
      setSuccess("Precio actualizado correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al actualizar el precio del producto");
      setTimeout(() => setError(null), 3000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para preparar eliminación del ítem
  const handlePrepareDeleteMenuItem = (itemId: number) => {
    setDeleteItemId(itemId);
    setShowDeleteConfirm(true);
  };
  
  // Función para eliminar un producto del menú (con confirmación)
  const handleDeleteMenuItem = async () => {
    if (!deleteItemId) return;
    
    setLoading(true);
    try {
      await removeMenuItem(menu.id, deleteItemId);
      
      // Actualizar estado local
      setMenuItems(menuItems.filter(item => item.id !== deleteItemId));
      setAlertMessage("Producto eliminado correctamente del menú");
      setShowSuccessDialog(true);
    } catch (err) {
      setAlertMessage("Error al eliminar el producto del menú");
      setShowErrorDialog(true);
      console.error(err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección de selección de productos */}
      <ProductSelectionList
        products={products}
        productCategories={productCategories}
        loading={productsLoading}
        selectedProductIds={selectedProductIds}
        onProductSelectionChange={handleProductSelectionChange}
        alreadySelectedProducts={[
          ...pendingItems.map(item => item.product),
          // Filtrar productos que ya están en el menú por su product_id
          ...products.filter(product => 
            (menuItems || []).some(menuItem => menuItem.product_id === product.id)
          )
        ]}
      />
      
      {/* Sección de productos pendientes para confirmar */}
      <ProductConfirmationTable
        pendingItems={pendingItems}
        productCategories={productCategories}
        onConfirmAll={handleConfirmAllProducts}
        onRemove={handleRemovePendingItem}
        onUpdatePrice={handleUpdatePendingPrice}
        onToggleAvailability={handleTogglePendingAvailability}
        loading={loading}
        success={success}
        error={error}
      />
      
      {/* Sección de productos asignados al menú */}
      <div className="border rounded-md p-4 shadow-sm bg-card">
        <h3 className="text-lg font-medium mb-4">Productos en el menú</h3>
        <MenuProductsTable
          menuItems={menuItems}
          onUpdatePrice={handleUpdateMenuItemPrice}
          onDelete={handlePrepareDeleteMenuItem}
        />
      </div>
    </div>
  );
}
