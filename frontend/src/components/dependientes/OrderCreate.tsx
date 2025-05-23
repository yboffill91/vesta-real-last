"use client";
import { useState } from "react";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { ProductTabs } from "./ProductTabs";
import {
  ProductInCategory,
  useCategoriesWithProducts,
} from "@/hooks/useCategoriesWithProducts";
import { useUpdateServiceSpotStatus } from "@/hooks/useUpdateServiceSpotStatus";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  price: number;
  // Agrega otros campos según tu modelo
}

interface SelectedProduct extends Product {
  quantity: number;
}

interface OrderCreateProps {
  service_spot_id: number;
  mesaNombre?: string;
  created_by: number; // ID del dependiente
}

export function OrderCreate({
  service_spot_id,
  mesaNombre,
  created_by,
}: OrderCreateProps) {
  // Estado global de productos seleccionados: { [productId]: { product, quantity } }
  const [selectedProducts, setSelectedProducts] = useState<{
    [id: number]: { product: ProductInCategory; quantity: number };
  }>({});
  const [rectifyMode, setRectifyMode] = useState(false);
  const { createOrder, loading, error } = useCreateOrder();
  const {
    updateStatus,
    loading: loadingStatus,
    error: errorStatus,
  } = useUpdateServiceSpotStatus();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { categories } = useCategoriesWithProducts();
  console.log(categories);

  // Handlers para tabs/cards
  const handleAdd = (product: ProductInCategory) => {
    setSelectedProducts((prev) => {
      const curr = prev[product.id]?.quantity || 0;
      return {
        ...prev,
        [product.id]: { product, quantity: curr + 1 },
      };
    });
  };
  const handleRemove = (product: ProductInCategory) => {
    setSelectedProducts((prev) => {
      const curr = prev[product.id]?.quantity || 0;
      return {
        ...prev,
        [product.id]: { product, quantity: Math.max(0, curr - 1) },
      };
    });
  };

  // Para el carrito rectificable
  const handleRectifyAdd = (product: ProductInCategory) => handleAdd(product);
  const handleRectifyRemove = (product: ProductInCategory) =>
    handleRemove(product);

  // Confirmar pedido (submit)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSuccessMsg(null);
    try {
      const items = Object.values(selectedProducts)
        .filter((p) => p.quantity > 0)
        .map((p) => ({ product_id: p.product.id, quantity: p.quantity }));
      if (!items.length) return;
      const orderPayload = {
        service_spot_id,
        created_by,
        items,
      };
      const response = await createOrder(orderPayload);
      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.success
      ) {
        await updateStatus(service_spot_id, "pedido_abierto");
        setSuccessMsg("¡Pedido creado y mesa actualizada a 'pedido_abierto'!");
        // Opcional: limpiar productos seleccionados aquí
      }
    } catch (err) {
      // El error ya se maneja por los hooks, pero podrías mostrar más feedback si quieres
    }
  };

  // Volver a agregar productos
  const handleBackToAdd = () => setRectifyMode(false);
  // Ir a rectificar
  const handleGoToRectify = () => setRectifyMode(true);

  // Render
  return (
    <div className="w-[100%] mx-auto p-4 bg-card rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Crear orden para mesa: {mesaNombre || service_spot_id}
      </h2>
      {!rectifyMode ? (
        <>
          <ProductTabs
            selectedProducts={Object.fromEntries(
              Object.entries(selectedProducts).map(([id, { quantity }]) => [
                id,
                quantity,
              ])
            )}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
          <div className="flex justify-end mt-6">
            <Button
              type="button"
              disabled={Object.values(selectedProducts).every(
                (p) => p.quantity === 0
              )}
              onClick={handleGoToRectify}
            >
              Rectificar pedido
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between flex-col">
            <h3 className="font-semibold mb-2">Carrito de pedido</h3>
            {/* <ul className="min-w-96 flex flex-col gap-2">
              {Object.values(selectedProducts).map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className={
                    "flex items-center gap-2 py-1 justify-between w-full border-b-2 border-dotted" +
                    (quantity === 0 ? "line-through text-muted-foreground" : "")
                  }
                >
                  <span>{product.name}</span>
                  <div className="flex gap-1 items-center">
                    <Button
                      variant={"outline"}
                      type="button"
                      onClick={() => handleRectifyRemove(product)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button onClick={() => handleRectifyAdd(product)}>+</Button>
                    <span className="text-xs text-muted-foreground">
                      x ${product.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul> */}
            <Table className="max-w-xl w-full mx-auto ">
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>SubTotal</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(selectedProducts).map(
                  ({ product, quantity }) => (
                    <TableRow key={product.id}>
                      <TableCell
                        className={cn(
                          quantity === 0 &&
                            "decoration-dashed bg-muted text-muted-foreground"
                        )}
                      >
                        {product.name}
                      </TableCell>
                      <TableCell
                        className={cn(
                          quantity === 0 &&
                            "decoration-dashed bg-muted text-muted-foreground"
                        )}
                      >
                        {quantity}
                      </TableCell>
                      <TableCell
                        className={cn(
                          quantity === 0 &&
                            "decoration-dashed bg-muted text-muted-foreground"
                        )}
                      >
                        {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          quantity === 0 &&
                            "decoration-dashed bg-muted text-muted-foreground"
                        )}
                      >
                        {(quantity * product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant={"outline"}
                          type="button"
                          onClick={() => handleRectifyRemove(product)}
                          size="sm"
                        >
                          -
                        </Button>
                        <Button
                          onClick={() => handleRectifyAdd(product)}
                          size="sm"
                        >
                          +
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" onClick={handleBackToAdd}>
              Agregar
            </Button>
            <Button
              type="button"
              disabled={
                Object.values(selectedProducts).every(
                  (p) => p.quantity === 0
                ) || loading
              }
              onClick={handleSubmit}
            >
              Confirmar pedido
            </Button>
          </div>
          {error && <div className="mt-2 text-destructive">{error}</div>}
          {errorStatus && (
            <div className="mt-2 text-destructive">{errorStatus}</div>
          )}
          {successMsg && (
            <div className="mt-2 text-success font-semibold">{successMsg}</div>
          )}
        </>
      )}
    </div>
  );
}
