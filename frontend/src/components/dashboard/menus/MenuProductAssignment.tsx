"use client";

import React, { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useMenus } from "@/hooks/useMenus";
import { Menu, MenuItem } from "@/models/menu";
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
import { SystemAlert } from "@/components/ui/system-alert";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";

// Import the subcomponents
import { ProductSelectionList } from "./ProductSelectionList";
import {
  ProductConfirmationTable,
  PendingMenuItem,
} from "./ProductConfirmationTable";
import { MenuProductsTable } from "./MenuProductsTable";
import { Button } from "@/components/ui";
import Link from "next/link";

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
    const selectedProducts = products.filter((product) =>
      selectedProductIds.includes(product.id)
    );

    // Crear los nuevos pendingItems (evitando duplicados)
    const newPendingItems = selectedProducts.map((product) => ({
      product,
      price: product.price?.toString() || "0",
      is_available: true,
    }));

    // Solo actualizar si hay cambios
    if (selectedProductIds.length > 0) {
      // Para evitar un loop infinito, hacemos una comparación previa en memoria
      // y solo actualizamos si realmente hay cambios
      const currentIds = pendingItems
        .map((item) => item.product.id)
        .sort()
        .join(",");
      const newIds = newPendingItems
        .map((item) => item.product.id)
        .sort()
        .join(",");

      if (currentIds !== newIds) {
        // Mantener los pendingItems existentes (para conservar ediciones)
        // pero solo si siguen en selectedProductIds
        const filteredPending = pendingItems.filter((item) =>
          selectedProductIds.includes(item.product.id)
        );

        // Añadir solo los nuevos productos que no están ya en pendingItems
        const pendingProductIds = filteredPending.map(
          (item) => item.product.id
        );
        const itemsToAdd = newPendingItems.filter(
          (item) => !pendingProductIds.includes(item.product.id)
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
    const addedItems: MenuItem[] = [];

    try {
      // Para cada item pendiente, hacer una llamada individual al backend
      for (const item of pendingItems) {
        // Validar que el precio sea un número válido y mayor que 0
        // Reemplazar comas por puntos para manejo internacional
        const sanitizedPrice = item.price.toString().replace(',', '.');
        const price = parseFloat(sanitizedPrice);
        
        // Log detallado para depuración
        console.log(`Producto: ${item.product.name} (ID: ${item.product.id})`);
        console.log(`  - Precio original: "${item.price}" (tipo: ${typeof item.price})`);
        console.log(`  - Precio sanitizado: "${sanitizedPrice}" (tipo: ${typeof sanitizedPrice})`);
        console.log(`  - Precio parseado: ${price} (tipo: ${typeof price})`);
        
        if (isNaN(price) || price <= 0) {
          console.error(`Precio inválido para el producto ${item.product.name}: ${item.price}`);
          continue; // Saltar este item
        }
        
        // Crear objeto a enviar (incluir menu_id como requiere MenuItemBase en el backend)
        const itemData = {
          menu_id: menu.id, // ¡Incluido explícitamente! Requerido por el backend
          product_id: item.product.id,
          price: price, // Número, no string
          is_available: item.is_available,
        };
        
        console.log('Datos a enviar al endpoint:', itemData);
        
        // Variable para almacenar respuesta del backend
        let newItem = null;
        
        try {
          newItem = await addMenuItem(menu.id, itemData);
          console.log('Respuesta del endpoint:', newItem);
        } catch (err) {
          console.error('Error al agregar producto:', err);
          // Seguimos con el siguiente producto
          continue;
        }

        // Verificar que el item se agregó correctamente
        if (newItem) {
          // Agregar el item devuelto por el backend a la lista de items añadidos
          addedItems.push({
            id: newItem.id,
            menu_id: menu.id,
            product_id: item.product.id,
            product_name: item.product.name,
            category_id: item.product.category_id,
            category_name: item.product.category_id
              ? productCategories.get(item.product.category_id)?.name ||
                "Sin categoría"
              : "Sin categoría",
            price: parseFloat(item.price),
            is_available: item.is_available,
          });
          successCount++;
        }
      }

      // Mostrar mensaje de éxito con diálogo
      if (successCount > 0) {
        setAlertMessage(
          `Se agregaron ${successCount} productos al menú exitosamente.`
        );
        setShowSuccessDialog(true);

        // Actualizar los items del menú con los datos reales del backend
        setMenuItems([...menuItems, ...addedItems]);

        // Limpiar pendientes y selecciones
        setPendingItems([]);
        setSelectedProductIds([]);
      } else {
        setAlertMessage("No se pudo agregar ningún producto al menú. Verifica que los precios sean válidos.");
        setShowErrorDialog(true);
      }
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
    setSelectedProductIds(
      selectedProductIds.filter((id) => id !== removedProductId)
    );
  };

  const handleUpdatePendingPrice = (index: number, newPrice: string) => {
    // Asegurar que solo se permitan valores numéricos y formatos válidos
    // Reemplazar comas por puntos para manejo internacional
    const sanitizedPrice = newPrice.replace(',', '.');
    
    // Verificar que sea un número válido
    if (sanitizedPrice !== '' && !isNaN(Number(sanitizedPrice))) {
      const updatedItems = [...pendingItems];
      // Guardar como string pero asegurando que sea convertible a número
      updatedItems[index].price = sanitizedPrice;
      setPendingItems(updatedItems);
    }
    // Si no es válido, no actualizamos el valor
  };

  const handleTogglePendingAvailability = (index: number) => {
    const updatedItems = [...pendingItems];
    updatedItems[index].is_available = !updatedItems[index].is_available;
    setPendingItems(updatedItems);
  };

  // Manejadores para MenuProductsTable
  const handleUpdateMenuItemPrice = async (
    itemId: number,
    newPrice: number
  ) => {
    setLoading(true);
    try {
      // Llamar al endpoint para actualizar el precio
      await updateMenuItem(menu.id, itemId, { price: newPrice });

      // Actualizar el estado local
      setMenuItems(
        menuItems.map((item) =>
          item.id === itemId ? { ...item, price: newPrice } : item
        )
      );

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
      setMenuItems(menuItems.filter((item) => item.id !== deleteItemId));
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
      <Link href={`/dashboard/menus`}>
        <Button variant={"outline"}>
          <ArrowLeft />
          Volver
        </Button>
      </Link>
      {/* Sección de selección de productos */}
      <ProductSelectionList
        products={products}
        productCategories={productCategories}
        loading={productsLoading}
        selectedProductIds={selectedProductIds}
        onProductSelectionChange={handleProductSelectionChange}
        alreadySelectedProducts={[
          ...pendingItems.map((item) => item.product),
          // Filtrar productos que ya están en el menú por su product_id
          ...products.filter((product) =>
            (menuItems || []).some(
              (menuItem) => menuItem.product_id === product.id
            )
          ),
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

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto se eliminará del
              menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMenuItem}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de éxito */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="mr-2" size={20} />
              Operación exitosa
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de error */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2" size={20} />
              Error
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
