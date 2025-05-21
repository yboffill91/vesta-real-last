"use client";
import { DashboardCards, FormWrapper } from "@/components/ui";
import { DashboardCardAlert } from "@/components/ui/dashboar-card-alert";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { Store } from "lucide-react";

export default function SalesAreasTable() {
  const { areas, loading, error } = useSalesAreas();

  if (loading) return <div>Cargando áreas de venta...</div>;
  if (error)
    return (
      <main className="container mx-auto max-w-3xl">
        <DashboardCards title="Areas de Venta" icon={Store}>
          <DashboardCardAlert
            variant="destructive"
            title="Error"
            alert={error}
            action="Intentar de nuevo"
            link="/dashboard/areas"
          />
        </DashboardCards>
      </main>
    );

  if (areas.length === 0) {
    return (
      <main className="container mx-auto max-w-3xl ">
        <DashboardCards title="Areas de Venta" icon={Store}>
          <DashboardCardAlert
            variant="warning"
            title="No hay áreas de venta registradas"
            alert="Aún no has creado ninguna área de venta."
            action="Crear área de venta"
            link="/dashboard/areas/add"
          />
        </DashboardCards>
      </main>
    );
  }

  return (
    <DashboardCards title="Áreas de Venta" icon={Store}>
      <p>{JSON.stringify(areas)}</p>
    </DashboardCards>
  );
}
