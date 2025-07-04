"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormWrapper } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { RootInput } from "@/components/ui/root-input";
import { Button } from "@/components/ui/Buttons";
import { Separator } from "@/components/ui/Separator";
import { SystemAlert } from "@/components/ui/system-alert";
import { Loader2 } from "lucide-react";
import { useEstablishmentStore } from "@/lib/establishment";
import { useCategories } from "@/hooks/useCategories";

// Definir el esquema de validación con Zod
const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  description: z
    .string()
    .max(200, "La descripción no puede exceder los 200 caracteres")
    .optional()
    .or(z.literal(""))
});

// Tipo inferido del esquema
type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { establishment } = useEstablishmentStore();
  const { createCategory } = useCategories();

  // Configurar react-hook-form con validación de Zod
  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: ""
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = methods;

  // Función de envío del formulario tipada correctamente
  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    setServerError(null);
    setLoading(true);

    try {
      const result = await createCategory({
        name: data.name,
        description: data.description,
        is_active: true, // Siempre activa
      });

      if (!result) {
        setServerError("Error al crear la categoría");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Éxito
      reset();
      setSuccessAlert(true);
      setShowAlert(true);
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setServerError(err?.message || "Error de red");
      setShowAlert(true);
      setLoading(false);
    }
  };



  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={successAlert ? "Categoría creada" : "Error al crear categoría"}
        description={
          successAlert
            ? "La categoría se creó correctamente."
            : serverError || "Ocurrió un error inesperado."
        }
        confirmText="Aceptar"
        variant={successAlert ? "default" : "destructive"}
        onConfirm={() => {
          setShowAlert(false);
          setServerError(null);
          setSuccessAlert(false);
        }}
      />
      <FormWrapper
        title="Agregar categoría"
        subtitle="Complete los datos para crear una nueva categoría de productos"
      >
        <Form {...methods}>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit((data) => {
                // Convertimos primero a unknown para satisfacer TypeScript
                const safeData = data as unknown as CategoryFormValues;
                return onSubmit(safeData);
              })();
            }}
          >
            <RootInput
              label="Nombre"
              htmlFor="name"
              error={errors.name?.message}
              {...register("name")}
              placeholder="Ej: Bebidas"
            />
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24"
                placeholder="Descripción de la categoría"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>


            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="ml-2">Creando categoría...</span>
                </>
              ) : (
                "Crear categoría"
              )}
            </Button>
            <Separator />
          </form>
        </Form>
      </FormWrapper>
    </>
  );
}
