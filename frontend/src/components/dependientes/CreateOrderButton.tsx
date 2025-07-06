import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { Button } from "../ui";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "../ui/alert-dialog";

export const CreateOrderButton: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { products, meta, clear } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    // Preparar payload para POST /api/v1/orders
    const items = products
      .filter((p) => !p.crossed && p.quantity > 0)
      .map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.price,
        notes: p.notes || undefined,
      }));
    // Obtener el id del usuario autenticado desde el store Zustand
    const user = useAuthStore.getState().user;
    const created_by = user?.id ?? null;
    if (!created_by) {
      setError("No se pudo obtener el usuario actual para created_by.");
      setLoading(false);
      return;
    }
    const payload = {
      service_spot_id: meta.service_spot_id,
      sales_area_id: meta.sales_area_id,
      menu_id: meta.menu_id,
      created_by,
      items,
    };
    try {
      // Log de depuración: esquema esperado
      console.log("[Order API] Esquema esperado (OrderWithItemsCreate):", {
        service_spot_id: "number (int)",
        sales_area_id: "number (int)",
        menu_id: "number (int)",
        items: [
          {
            product_id: "number (int)",
            quantity: "number (int)",
            unit_price: "number (float)",
            notes: "string | undefined"
          }
        ]
      });
      // Log de depuración: payload real
      console.log("[Order API] Payload enviado:", payload, JSON.stringify(payload));
      // 1. Crear la orden
      const res = await fetchApi("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.success) throw new Error(res.error || "Error creando orden");
      // 2. Actualizar el estado del service spot
      await fetchApi(`/api/v1/service-spots/${meta.service_spot_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "pedido_abierto" }),
      });
      clear();
      setOpen(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Nombre de la mesa/spot si está disponible
  const mesaLabel = meta.service_spot_id ? `Mesa ${meta.service_spot_id}` : "la mesa";

  return (
    <>
      <div className="flex flex-col gap-2 mt-8">
        <Button onClick={handleCreateOrder} disabled={loading || products.length === 0}>
          {loading ? "Creando orden..." : "Confirmar y crear orden"}
        </Button>
        {error && <div className="text-destructive text-sm text-center">{error}</div>}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Orden tomada!</AlertDialogTitle>
            <AlertDialogDescription>
              La orden ha sido registrada correctamente para {mesaLabel}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setOpen(false)}>
            Cerrar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
