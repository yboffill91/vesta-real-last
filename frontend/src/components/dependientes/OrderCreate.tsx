"use client";
import { useState } from "react";
import { useCreateOrderWithItems } from "@/hooks/useCreateOrderWithItems";
import { ProductTabs } from "./ProductTabs";
import {
  ProductInCategory,
  useCategoriesWithProducts,
} from "@/hooks/useCategoriesWithProducts";
import { useUpdateServiceSpotStatus } from "@/hooks/useUpdateServiceSpotStatus";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
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
  sales_area_id: number; // ID del área de ventas
  menu_id: number; // ID del menú
}

export function OrderCreate({
  service_spot_id,
  mesaNombre,
  created_by,
  sales_area_id,
  menu_id,
}: OrderCreateProps) {
  // Estado global de productos seleccionados: { [productId]: { product, quantity } }
  const [selectedProducts, setSelectedProducts] = useState<{
    [id: number]: {
      product: ProductInCategory;
      quantity: number;
      note?: string;
    };
  }>({});
  const [rectifyMode, setRectifyMode] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const { createOrderWithItems, loading, error, success } =
    useCreateOrderWithItems();
  const {
    updateStatus,
    loading: loadingStatus,
    error: backendUpdateError,
  } = useUpdateServiceSpotStatus();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { categories } = useCategoriesWithProducts();

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

  // Handler para editar nota de un producto
  const handleNoteChange = (productId: number, note: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        note,
      },
    }));
  };

  // Estado para mostrar el input de nota
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Confirmar pedido (submit)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSuccessMsg(null);
    try {
      const items = Object.values(selectedProducts)
        .filter((p) => p.quantity > 0)
        .map((p) => ({
          product_id: p.product.id,
          quantity: p.quantity,
          unit_price: p.product.price,
          notes: p.note,
        }));
      if (!items.length) return;
      const orderPayload = {
        service_spot_id,
        sales_area_id: typeof sales_area_id !== "undefined" ? sales_area_id : null,
        menu_id, // Usa el prop recibido
        created_by,
      };
      console.log("Payload enviado:", orderPayload);
      if (!orderPayload.sales_area_id) {
        setSuccessMsg(null);
        throw new Error(
          "No se ha seleccionado un área de ventas (sales_area_id)"
        );
      }
      const orderId = await createOrderWithItems(orderPayload, items);
      if (orderId) {
        await updateStatus(service_spot_id, "pedido_abierto");
        setSuccessMsg("¡Pedido creado y mesa actualizada a 'pedido_abierto'!");
        // Opcional: limpiar productos seleccionados aquí
      }
    } catch (err: any) {
      // El error ya se maneja por los hooks, pero podrías mostrar más feedback si quieres
      if (err && err.message) {
        setErrorStatus("Error: " + err.message);
      } else {
        setErrorStatus("Error desconocido al crear la orden");
      }
    }
  };

  // Volver a agregar productos
  const handleBackToAdd = () => setRectifyMode(false);

  // Ir a rectificar
  const handleGoToRectify = () => setRectifyMode(true);

  // Render
  return (
    <Card className="w-[100%] h-[100%] ">
      <CardHeader>
        <h2 className="text-xl font-bold mb-4">
          Crear orden para mesa: {mesaNombre || service_spot_id}
        </h2>
      </CardHeader>
      <CardContent>
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
              <h3 className="font-semibold mb-2">Rectificar pedido</h3>

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
                    ({ product, quantity, note }) => [
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
                        <TableCell className="flex gap-2 items-center">
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
                          <Button
                            variant={"outline"}
                            size="sm"
                            onClick={() =>
                              setEditingNoteId(
                                editingNoteId === product.id
                                  ? null
                                  : product.id
                              )
                            }
                          >
                            <Pencil />
                          </Button>
                        </TableCell>
                      </TableRow>,
                      (note || editingNoteId === product.id) && (
                        <TableRow key={`note-${product.id}`}>
                          <TableCell colSpan={5} className="bg-muted/50">
                            {editingNoteId === product.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={note || ""}
                                  onChange={(e) =>
                                    handleNoteChange(product.id, e.target.value)
                                  }
                                  placeholder="Agregar nota"
                                  className="border rounded px-2 py-1 w-full"
                                  autoFocus
                                  onBlur={() => setEditingNoteId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      setEditingNoteId(null);
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingNoteId(null)}
                                >
                                  Guardar
                                </Button>
                              </div>
                            ) : (
                              <span className="italic text-muted-foreground">
                                Nota: {note}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    ]
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold text-right">
                      Total
                    </TableCell>
                    <TableCell colSpan={2} className="font-bold">
                      {Object.values(selectedProducts)
                        .reduce(
                          (sum, { product, quantity }) =>
                            sum + quantity * product.price,
                          0
                        )
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleBackToAdd}
                variant={"outline"}
              >
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
              <Button variant={"outline"} asChild>
                <Link href="/dependientes">Cancelar</Link>
              </Button>
            </div>
            {error && <div className="mt-2 text-destructive">{error}</div>}
            {success && (
              <div className="mt-2 text-success font-semibold">
                ¡Pedido creado y mesa actualizada a 'pedido_abierto'!
              </div>
            )}
            {errorStatus && (
              <div className="mt-2 text-destructive">{errorStatus}</div>
            )}
            {successMsg && (
              <div className="mt-2 text-success font-semibold">
                {successMsg}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
