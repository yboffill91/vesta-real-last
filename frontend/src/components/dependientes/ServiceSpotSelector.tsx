"use client";
import React, { useState, useEffect } from "react";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import type { ServiceSpot } from "@/models/service-spot";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { OpenOrdersTable } from "./OpenOrdersTable";
import { useRouter } from "next/navigation";

export function ServiceSpotSelector() {
  const { areas, loading, error, reload } = useSalesAreas();
  const router = useRouter();
  const [tab, setTab] = useState("libres");
  const [selectedAreaId, setSelectedAreaId] = useState<number | "all">("all");

  // Refetch automático cada 20 s egundos
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
    <>
      {/* Filtro de área activa */}
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="area-filter" className="font-semibold">
          Área:
        </label>
        <Select
          value={selectedAreaId.toString()}
          onValueChange={(value) =>
            setSelectedAreaId(value === "all" ? "all" : Number(value))
          }
        >
          <SelectTrigger className="w-48" id="area-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id.toString()}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full bg-muted rounded-lg p-2"
      >
        {/* Solo muestra los tabs de selección de puesto y pedidos abiertos si no hay selección */}

        <TabsList>
          <TabsTrigger value="libres">Puestos libres</TabsTrigger>
          <TabsTrigger value="abiertas">Pedidos abiertos</TabsTrigger>
        </TabsList>

        <TabsContent value="libres">
          <div className="flex flex-col gap-6 w-full mx-auto">
            {(selectedAreaId === "all"
              ? areas
              : areas.filter((area) => area.id === selectedAreaId)
            ).map((area) => (
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
                        onClick={() => {
                          const params = new URLSearchParams({
                            areaId: area.id.toString(),
                            spotId: spot.id.toString(),
                          });
                          router.push(
                            `/dependientes/orden?${params.toString()}`
                          );
                        }}
                        className="flex flex-col items-center justify-center h-24 w-36"
                      >
                        <span className="font-bold text-2xl">{spot.name}</span>
                        <span className="text-xs capitalize">
                          {spot.status}
                        </span>
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
      </Tabs>
    </>
  );
}
