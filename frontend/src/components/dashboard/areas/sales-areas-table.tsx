"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardCards } from "@/components/ui";
import { DashboardCardAlert } from "@/components/ui/dashboar-card-alert";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { useDeleteSalesArea } from "@/hooks/useDeleteSalesArea";
import { SystemAlert } from "@/components/ui/system-alert";
import { Store, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/Buttons";

export default function SalesAreasTable() {
  const { areas, loading, error } = useSalesAreas();
  const [deleteTarget, setDeleteTarget] = useState<null | {
    id: number;
    name: string;
  }>(null);
  const [showError, setShowError] = useState(false);
  const {
    deleteSalesArea,
    loading: deleting,
    error: deleteError,
    success: deleteSuccess,
  } = useDeleteSalesArea();
  const router = useRouter();

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

  // Feedback tras eliminar
  if (deleteSuccess) {
    setTimeout(() => window.location.reload(), 500); // reload para refrescar lista
  }

  return (
    <>
      {/* Modal de error al eliminar */}
      <SystemAlert
        open={showError}
        setOpen={setShowError}
        title="Error al eliminar"
        description={deleteError || "No se pudo eliminar el área de venta."}
        confirmText="Cerrar"
        variant="destructive"
        onConfirm={() => setShowError(false)}
      />
      {/* Modal de confirmación eliminar */}
      <SystemAlert
        open={!!deleteTarget}
        setOpen={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="¿Eliminar área de venta?"
        description={
          deleteTarget
            ? `¿Estás seguro que deseas eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) {
            const ok = await deleteSalesArea(deleteTarget.id);
            if (!ok) setShowError(true);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
      <DashboardCards title="Áreas de Venta" icon={Store}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Nombre</th>
                <th className="px-2 py-1 text-left">Descripción</th>
                <th className="px-2 py-1 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id} className="border-b">
                  <td className="px-2 py-1">{area.name}</td>
                  <td className="px-2 py-1">{area.description || "-"}</td>
                  <td className="px-2 py-1">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/areas/${area.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting}
                        onClick={() =>
                          setDeleteTarget({ id: area.id, name: area.name })
                        }
                      >
                        {deleting && deleteTarget?.id === area.id ? (
                          <span className="animate-spin">
                            <Trash className="h-4 w-4" />
                          </span>
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCards>
    </>
  );
}
