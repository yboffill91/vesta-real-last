"use client";
import { OrderCreate } from "@/components/dependientes/OrderCreate";
import { useSearchParams } from "next/navigation";

export default function OrdenPage() {
  // Obtener parámetros de la URL (ej: mesa, id, etc)
  const searchParams = useSearchParams();
  const service_spot_id = Number(searchParams.get("spot_id"));
  const mesaNombre = searchParams.get("mesa") || undefined;
  const created_by = Number(searchParams.get("user_id")); // Ajusta según tu auth/context

  if (!service_spot_id || !created_by) {
    return (
      <div className="text-destructive">Faltan datos para crear la orden.</div>
    );
  }

  return (
    <OrderCreate
      service_spot_id={service_spot_id}
      mesaNombre={mesaNombre}
      created_by={created_by}
    />
  );
}
