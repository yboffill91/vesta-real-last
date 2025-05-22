"use client";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, RootInput } from "@/components/ui";
import { useEditSalesArea } from "@/hooks/useEditSalesArea";
import { useEffect, useState } from "react";

const salesAreaSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().optional(),
});

type EditSalesAreaFormValues = z.infer<typeof salesAreaSchema>;

type EditSalesAreaFormProps = {
  area: any; // Debe ser tipado correctamente con el modelo de SalesArea
  areaId: number;
};

export function EditSalesAreaForm({ area, areaId }: EditSalesAreaFormProps) {
  const methods = useForm<EditSalesAreaFormValues>({
    resolver: zodResolver(salesAreaSchema),
    defaultValues: { name: "", description: "" },
  });
  const { handleSubmit, reset, formState } = methods;
  const {
    editSalesArea,
    loading: saving,
    error: editError,
    success,
  } = useEditSalesArea(areaId, area);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (area) {
      reset({ name: area.name ?? "", description: area.description ?? "" });
    }
  }, [area, reset]);

  const onSubmit = async (data: EditSalesAreaFormValues) => {
    if (!area) return;
    const ok = await editSalesArea({
      name: data.name,
      description: data.description,
      is_active: true, // o area.is_active si quieres mantener el valor actual
    });
    if (ok) setShowSuccess(true);
    else setShowError(true);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <RootInput
          label="Nombre del Área"
          htmlFor="name"
          error={formState.errors.name?.message}
          disabled={saving}
          {...methods.register("name")}
        />
        <RootInput
          label="Descripción"
          htmlFor="description"
          error={formState.errors.description?.message}
          disabled={saving}
          {...methods.register("description")}
        />
        <Button type="submit" variant="default" disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
        {editError && <div className="text-destructive">{editError}</div>}
        {showSuccess && (
          <div className="text-success">Área actualizada correctamente.</div>
        )}
        {showError && (
          <div className="text-destructive">
            Ocurrió un error al actualizar.
          </div>
        )}
      </form>
    </FormProvider>
  );
}
