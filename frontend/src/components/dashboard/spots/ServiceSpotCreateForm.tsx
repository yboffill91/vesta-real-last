"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { FormWrapper } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { RootInput } from "@/components/ui/root-input";
import { Button } from "@/components/ui/Buttons";
import { Separator } from "@/components/ui/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { SystemAlert } from "@/components/ui/system-alert";

import { useServiceSpots } from "@/hooks/useServiceSpots";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { CreateServiceSpotDTO } from "@/hooks/useServiceSpots";

// Schema de validación para el formulario
const serviceSpotSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  capacity: z.coerce.number().int().min(1, "La capacidad debe ser mayor a 0"),
  sales_area_id: z.coerce.number().int().positive("Debes seleccionar un área"),
});

type FormValues = z.infer<typeof serviceSpotSchema>;

export function ServiceSpotCreateForm() {
  const router = useRouter();
  const { createServiceSpot } = useServiceSpots();
  const { areas, loading: loadingAreas } = useSalesAreas();

  // Estados para alertas y carga
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Configuración del formulario siguiendo la convención establecida
  const methods = useForm<FormValues>({
    resolver: zodResolver(serviceSpotSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      capacity: 1,
      sales_area_id: undefined,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = methods;

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const response = await createServiceSpot(data as CreateServiceSpotDTO);

      if (!response.success) {
        setServerError(
          response.error || "Error al crear el puesto de servicio"
        );
        setShowAlert(true);
        setLoading(false);
        return;
      }

      reset();
      setSuccessAlert(true);
      setShowAlert(true);
      setLoading(false);
    } catch (error: any) {
      setServerError(error?.message || "Error de red");
      setShowAlert(true);
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push("/dashboard/spots");
  };

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={successAlert ? "Puesto creado" : "Error al crear puesto"}
        description={
          successAlert
            ? "El puesto de servicio se creó correctamente."
            : serverError || "Ocurrió un error inesperado."
        }
        confirmText="Aceptar"
        variant={successAlert ? "default" : "destructive"}
        onConfirm={() => {
          setShowAlert(false);
          setServerError(null);
          if (successAlert) {
            handleSuccess();
          }
          setSuccessAlert(false);
        }}
      />

      <FormWrapper
        title="Agregar puesto de servicio"
        subtitle="Complete los datos para crear un nuevo puesto de servicio"
      >
        <Form {...methods}>
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <RootInput
              label="Nombre"
              htmlFor="name"
              error={errors.name?.message}
              {...register("name")}
              placeholder="Ej: Mesa 1, Barra 2"
            />

            <RootInput
              label="Descripción (opcional)"
              htmlFor="description"
              error={errors.description?.message}
              {...register("description")}
              placeholder="Ej: Mesa en área de fumadores"
            />

            <RootInput
              label="Capacidad"
              htmlFor="capacity"
              type="number"
              min="1"
              error={errors.capacity?.message}
              {...register("capacity")}
              placeholder="Ej: 4"
            />

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="sales_area_id"
              >
                Área de venta
              </label>
              <Select
                value={watch("sales_area_id")?.toString() || ""}
                onValueChange={(value) =>
                  setValue("sales_area_id", parseInt(value))
                }
                name="sales_area_id"
                disabled={loadingAreas}
              >
                <SelectTrigger id="sales_area_id">
                  <SelectValue placeholder="Selecciona un área de venta" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sales_area_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.sales_area_id.message}
                </p>
              )}
            </div>

            <div className="flex  mt-4">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span className="ml-2">Creando puesto...</span>
                  </>
                ) : (
                  "Crear puesto"
                )}
              </Button>
            </div>

            <Separator />
          </form>
        </Form>
      </FormWrapper>
    </>
  );
}
