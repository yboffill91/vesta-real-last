// Página para tomar una nueva orden a partir de parámetros en la URL
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderMenuTabs } from "@/components/dependientes/OrderMenuTabs";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { useOrderStore } from "@/store/orderStore";
import { Button } from "@/components/ui";
import { CircleOff } from "lucide-react";

export default function NuevaOrdenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const areaId = Number(searchParams.get("areaId"));
  const spotId = Number(searchParams.get("spotId"));
  const { areas, loading, error } = useSalesAreas();
  const clearOrder = useOrderStore((state) => state.clear);
  const setMeta = useOrderStore((state) => state.setMeta);

  useEffect(() => {
    // Limpiar store y setear meta con los IDs de la url
    clearOrder();
    setMeta({ sales_area_id: areaId, service_spot_id: spotId });
  }, [areaId, spotId]);

  if (!areaId || !spotId) {
    return (
      <div className="p-6 text-destructive">
        Faltan parámetros de área o puesto.
      </div>
    );
  }
  if (loading) return <div className="p-6">Cargando datos de área...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;

  const area = areas.find((a) => a.id === areaId);
  const spot = area?.service_spots?.find((s) => s.id === spotId);

  return (
    <div className="w-fullb mx-auto mt-8 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-card p-4 rounded shadow border">
        <div>
          <span className="font-semibold">Tomando Pedido a:&nbsp;</span>
          <span className="font-bold text-primary">
            {spot ? `${spot.name} (${area?.name})` : "-"}
          </span>
        </div>
        <Button
          onClick={() => {
            clearOrder();
            router.push("/dependientes");
          }}
        >
          <CircleOff />
          Cancelar
        </Button>
      </div>
      <OrderMenuTabs />
    </div>
  );
}
