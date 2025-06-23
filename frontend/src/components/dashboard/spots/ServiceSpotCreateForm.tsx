"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { Label } from "@/components/ui";
import { CardContent, CardFooter } from "@/components/ui";
import { useServiceSpots } from "@/hooks/useServiceSpots";
import { useSalesAreas } from "@/hooks/useSalesAreas";
import { CreateServiceSpotDTO } from "@/hooks/useServiceSpots";
import { InputWithLabel } from "./InputWithLabel";

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

  // Estados para el diálogo de alerta
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Configuración del formulario siguiendo la convención establecida
  const methods = useForm<FormValues>({
    resolver: zodResolver(serviceSpotSchema),
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
  } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await createServiceSpot(data as CreateServiceSpotDTO);
      if (response.success) {
        setIsSuccess(true);
        setDialogMessage("Puesto de servicio creado exitosamente.");
        setDialogOpen(true);
      } else {
        setIsSuccess(false);
        setDialogMessage(
          response.error || "Error al crear el puesto de servicio."
        );
        setDialogOpen(true);
      }
    } catch (error) {
      setIsSuccess(false);
      setDialogMessage("Error al procesar la solicitud.");
      setDialogOpen(true);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (isSuccess) {
      router.push("/dashboard/spots");
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <InputWithLabel
                id="name"
                label="Nombre"
                placeholder="Mesa 1, Barra 2, etc."
                {...register("name")}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <InputWithLabel
                id="description"
                label="Descripción (opcional)"
                placeholder="Descripción del puesto"
                {...register("description")}
                error={errors.description?.message}
              />
            </div>

            <div className="space-y-2">
              <InputWithLabel
                id="capacity"
                type="number"
                label="Capacidad"
                placeholder="Número de personas"
                min="1"
                {...register("capacity")}
                error={errors.capacity?.message}
              />
            </div>

            <div className="space-y-2">
              <div className="grid gap-2">
                <Label htmlFor="sales_area_id">Área de venta</Label>
                <select
                  id="sales_area_id"
                  disabled={loadingAreas}
                  className="flex h-9 w-full rounded-md border border-foreground/20 bg-primary/5 px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...register("sales_area_id")}
                >
                  <option value="">Selecciona un área de venta</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                {errors.sales_area_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.sales_area_id.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/spots")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear puesto"}
            </Button>
          </CardFooter>
        </Form>
      </FormProvider>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSuccess ? "Operación exitosa" : "Error"}
            </AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
