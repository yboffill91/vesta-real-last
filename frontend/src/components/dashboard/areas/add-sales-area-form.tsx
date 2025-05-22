"use client";
"use client";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, RootInput } from "@/components/ui";
import { FormWrapper } from "@/components/ui/FormWrapper";
import { EstablishmentSelector } from "./EstablishmentSelector";
import { useRouter } from "next/navigation";
import { useCreateSalesArea } from "@/hooks/useCreateSalesArea";
import { useEstablishment } from "@/hooks/use-establishment";
import { useState } from "react";
import { SystemAlert } from "@/components/ui/system-alert";

const salesAreaSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().optional(),
  establishment_id: z.preprocess((val) => Number(val), z.number({
    required_error: "Selecciona un establecimiento",
  })),
});

type SalesAreaFormInput = {
  name: string;
  description?: string;
  establishment_id?: number | string;
};

type SalesAreaFormValues = z.infer<typeof salesAreaSchema>;

export default function AddSalesAreaForm() {
  const methods = useForm<SalesAreaFormInput>({
    resolver: zodResolver(salesAreaSchema),
    defaultValues: { name: "", description: "", establishment_id: undefined },
  });
  const { handleSubmit, register, formState, setValue, watch } = methods;
  const { createSalesArea, loading, error } = useCreateSalesArea();
  const {
    establishment,
    loading: estLoading,
    error: estError,
  } = useEstablishment();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
const [showSuccess, setShowSuccess] = useState(false);
const [showError, setShowError] = useState(false);

  const onSubmit = async (data: SalesAreaFormValues) => {
    setSubmitError(null);
    try {
      await createSalesArea({
        name: data.name,
        description: data.description,
        is_active: true,
        establishment_id: Number(data.establishment_id),
      });
      setShowSuccess(true); // Mostrar feedback visual de éxito
      // router.push("/dashboard/areas"); // Ahora se navega al confirmar el modal
    } catch (err: any) {
      setSubmitError(err.message || "Error al crear el área de venta");
      setShowError(true);
    }
  };

  return (
    <>
      <SystemAlert
        open={showSuccess}
        setOpen={setShowSuccess}
        title="Área de venta creada"
        description="El área de venta se creó correctamente."
        confirmText="Ir a listado"
        onConfirm={() => router.push("/dashboard/areas")}
      />
      <SystemAlert
        open={showError}
        setOpen={setShowError}
        title="Error"
        description={submitError || "Ocurrió un error inesperado."}
        variant="destructive"
        confirmText="Cerrar"
      />
      <FormWrapper title="Agregar Área de Venta">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <RootInput
            label="Nombre del Área"
            htmlFor="name"
            error={formState.errors.name?.message}
            disabled={loading}
            {...register("name")}
          />
          <RootInput
            label="Descripción"
            htmlFor="description"
            error={formState.errors.description?.message}
            disabled={loading}
            {...register("description")}
          />
          <div>
            <label className="block font-medium mb-1">Establecimiento</label>
            <EstablishmentSelector disabled={loading} />
          </div>
          {submitError && <div className="text-destructive text-sm">{submitError}</div>}
          <Button type="submit" variant="default" disabled={loading}>
            {loading ? "Guardando..." : "Crear Área de Venta"}
          </Button>
        </form>
      </FormProvider>
    </FormWrapper>
  </>

  );
}
