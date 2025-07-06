"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { Button } from "@/components/ui/Buttons";
import { Separator } from "../ui/Separator";

import { useState } from "react";
import { OrderMenuTabs } from "./OrderMenuTabs";
import { ArrowLeft } from "lucide-react";

export function ServiceSpotSelector({
  onSelect,
}: {
  onSelect: (spot: any) => void;
}) {
  const { areas, loading, error } = useSalesAreas();
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
  const setMeta = require("@/store/orderStore").useOrderStore((state: any) => state.setMeta);

  if (loading) {
    return <div className="text-center py-8">Cargando áreas y puestos...</div>;
  }
  if (error) {
    return <div className="text-destructive text-center py-8">{error}</div>;
  }
  if (!areas.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No hay áreas de ventas ni puestos activos.
      </div>
    );
  }

  if (selectedSpot) {
    return (
      <div className="flex flex-col gap-4 w-full mx-auto">
        <Card className="rounded-lg border p-2 bg-card text-card-foreground absolute top-2 right-2">
          <CardTitle className="font-semibold">{selectedSpot.name}</CardTitle>
          <CardDescription className="">Toma de Pedido: </CardDescription>
        </Card>
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => setSelectedSpot(null)} variant={"outline"}>
            <ArrowLeft /> Volver a Selección de Puestos
          </Button>
        </div>
        <OrderMenuTabs
          onSelectItem={(item) => {
            // Aquí puedes manejar la selección del item del menú
            // y continuar el flujo de toma de pedido
            // Por ahora solo logueamos
            console.log(
              "Item seleccionado:",
              item,
              "para el puesto:",
              selectedSpot
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      {areas.map((area) => (
        <Card key={area.id} className="bg-card/50 border">
          <CardHeader>
            <CardTitle>{area.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="mb-2" />
            <div className="flex flex-wrap gap-4">
              {(() => {
                const activeSpots =
                  area.service_spots?.filter((spot) => spot.is_active) || [];
                // Al hacer click en un puesto, guarda los ids en el store

                if (activeSpots.length === 0) {
                  return (
                    <div className="text-muted-foreground text-center w-full py-4">
                      No hay puestos activos en esta área de venta.
                    </div>
                  );
                }
                return activeSpots.map((spot) => (
  <Button
    key={spot.id}
    onClick={() => {
      setSelectedSpot({ ...spot, sales_area_id: area.id });
      setMeta({ service_spot_id: spot.id, sales_area_id: area.id });
    }}
    className="flex flex-col gap-2 min-h-24"
    disabled={spot.status !== "libre"}
  >
    <h3 className="font-bold text-lg">{spot.name}</h3>
    <span className="text-xs capitalize">
      {spot.status === "pedido_abierto"
        ? "Pedido abierto"
        : spot.status}
    </span>
  </Button>
));
              })()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
