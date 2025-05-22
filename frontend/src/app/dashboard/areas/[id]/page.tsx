"use client";
import { useParams } from "next/navigation";
import { EditSalesAreaForm } from "@/components/dashboard/areas/edit-sales-area-form";
import { useSalesArea } from "@/hooks/useSalesArea";
import { FormWrapper } from "@/components/ui";

export default function EditSalesAreaPage() {
  const params = useParams();
  const areaId = Number(params.id);
  if (!areaId || isNaN(areaId)) {
    return (
      <div className="p-8 text-destructive">
        Falta el parámetro de área a editar.
      </div>
    );
  }
  const { area, loading, error } = useSalesArea(areaId);

  if (loading)
    return <div className="py-10 text-center">Cargando área de venta...</div>;
  if (error)
    return <div className="py-10 text-center text-destructive">{error}</div>;
  if (!area)
    return (
      <div className="py-10 text-center text-destructive">
        Área no encontrada
      </div>
    );

  return (
    <FormWrapper title="Editar Área de Venta" subtitle="">
      <EditSalesAreaForm area={area} areaId={areaId} />
    </FormWrapper>
  );
}
