import React, { useState, useEffect } from "react";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import type { ServiceSpot } from "@/models/service-spot";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { OpenOrdersTable } from "./OpenOrdersTable";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface SelectedSpot {
  spotId: number;
  areaId: number;
}

export function ServiceSpotSelector() {
  const { areas, loading, error, reload } = useSalesAreas();
  const [selected, setSelected] = useState<SelectedSpot | null>(null);
  const [tab, setTab] = useState("libres");

  // Refetch automático cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, 20000);
    return () => clearInterval(interval);
  }, [reload]);

  if (loading)
    return <div className="text-center py-8">Cargando áreas y puestos...</div>;
  if (error)
    return <div className="text-destructive text-center py-8">{error}</div>;
  if (!areas.length)
    return (
      <div className="text-muted-foreground text-center py-8">
        No hay áreas de ventas ni puestos activos.
      </div>
    );

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-full bg-muted rounded-lg p-2"
    >
      <TabsList>
        <TabsTrigger value="libres">Puestos libres</TabsTrigger>
        <TabsTrigger value="abiertas">Pedidos abiertos</TabsTrigger>
      </TabsList>
      <TabsContent value="libres">
        <div className="flex flex-col gap-6 w-full mx-auto">
          {areas.map((area) => (
            <div
              key={area.id}
              className="border rounded p-4 mb-4 bg-secondary/5"
            >
              <h2 className="font-bold text-lg mb-2">{area.name}</h2>
              <hr />
              <div className="flex flex-wrap gap-4 p-2">
                {(() => {
                  const libres = (area.service_spots || []).filter(
                    (spot) => spot.is_active && spot.status === "libre"
                  );
                  if (libres.length === 0) {
                    return (
                      <div className="text-muted-foreground italic p-4 w-full text-center">
                        Todos los puestos de servicio están ocupados en esta
                        área.
                      </div>
                    );
                  }
                  return libres.map((spot: ServiceSpot) => (
                    <Button
                      key={spot.id}
                      onClick={() =>
                        setSelected({ spotId: spot.id, areaId: area.id })
                      }
                      className="flex flex-col items-center justify-center h-24 w-36"
                    >
                      <span className="font-bold text-2xl">{spot.name}</span>
                      <span className="text-xs capitalize">{spot.status}</span>
                    </Button>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="abiertas">
        <OpenOrdersTable />
      </TabsContent>
      {/* TabsContent para pedidos abiertos se agregará en el futuro */}
    </Tabs>
  );
}
