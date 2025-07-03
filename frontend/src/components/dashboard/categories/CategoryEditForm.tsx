"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormWrapper } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { RootInput } from "@/components/ui/root-input";
import { Button } from "@/components/ui/Buttons";
import { Separator } from "@/components/ui/Separator";
import { SystemAlert } from "@/components/ui/system-alert";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/models/category";
import { ToggleButton } from "@/components/ui/ToggleButton";

// Definir explícitamente el tipo de los valores del formulario para evitar problemas de tipado
type CategoryFormValues = {
  name: string;
  is_active: boolean;
  description?: string;
};

const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  description: z
    .string()
    .max(200, "La descripción no puede exceder los 200 caracteres")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export function CategoryEditForm({ categoryId }: { categoryId: number }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  const { getCategoryById, updateCategory } = useCategories();

  // Usamos el resolver con el esquema ya tipado correctamente
  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any, // Usamos any como último recurso para evitar errores de tipado
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
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

  // Cargar los datos de la categoría
  useEffect(() => {
    const loadCategory = async () => {
      setInitialLoading(true);
      try {
        const data = await getCategoryById(categoryId);
        if (data) {
          setCategory(data);
          // Actualizar el formulario con los datos
          setValue("name", data.name);
          setValue("description", data.description || "");
          setValue("is_active", data.is_active);
        } else {
          setServerError("No se encontró la categoría");
          setShowAlert(true);
        }
      } catch (err: any) {
        setServerError(err?.message || "Error al cargar la categoría");
        setShowAlert(true);
      } finally {
        setInitialLoading(false);
      }
    };

    loadCategory();
  }, [categoryId, getCategoryById, setValue]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!category) {
      setServerError("No se pudo cargar la información de la categoría");
      setShowAlert(true);
      return;
    }

    setServerError(null);
    setLoading(true);

    try {
      const result = await updateCategory(categoryId, {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
      });

      if (!result) {
        setServerError("Error al actualizar la categoría");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Éxito
      setSuccessAlert(true);
      setShowAlert(true);
      setLoading(false);
      setCategory(result); // Actualizar la categoría en el estado
    } catch (err: any) {
      setServerError(err?.message || "Error de red");
      setShowAlert(true);
      setLoading(false);
    }
  };

  const isActive = watch("is_active");

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2">Cargando categoría...</span>
      </div>
    );
  }

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={successAlert ? "Categoría actualizada" : "Error"}
        description={
          successAlert
            ? "La categoría se actualizó correctamente."
            : serverError || "Ocurrió un error inesperado."
        }
        confirmText="Aceptar"
        variant={successAlert ? "default" : "destructive"}
        onConfirm={() => {
          setShowAlert(false);
          setServerError(null);
          if (successAlert) {
            setSuccessAlert(false);
          }
        }}
      />
      <FormWrapper
        title={`Editar categoría: ${category?.name || ""}`}
        subtitle="Modifique los datos de la categoría"
      >
        <Form {...methods}>
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver
            </Button>
          </div>
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit as any)}
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
            <div className="flex items-center space-x-2">
              <ToggleButton
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked: boolean) =>
                  setValue("is_active", checked)
                }
                activeIcon={
                  <CheckCircle size={16} className="text-green-500" />
                }
                inactiveIcon={<XCircle size={16} className="text-red-500" />}
                activeText="Categoría activa"
                inactiveText="Categoría inactiva"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="ml-2">Guardando cambios...</span>
                </>
              ) : (
                "Actualizar categoría"
              )}
            </Button>
            <Separator />
          </form>
        </Form>
      </FormWrapper>
    </>
  );
}
