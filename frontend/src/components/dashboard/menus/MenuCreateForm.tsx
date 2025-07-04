"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMenus } from "@/hooks/useMenus";
import { Button, RootInput } from "@/components/ui";
import { Save } from "lucide-react";

// Definición del esquema de validación con Zod
const menuCreateSchema = z.object({
  name: z.string().min(1, "El nombre del menú es requerido"),
  description: z.string().optional(),
  valid_date: z.string().min(1, "La fecha de validez es requerida"),
});

type MenuCreateSchema = z.infer<typeof menuCreateSchema>;

interface MenuCreateFormProps {
  onSuccess?: () => void;
}

export function MenuCreateForm({ onSuccess }: MenuCreateFormProps) {
  const { createMenu, error } = useMenus();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const methods = useForm<MenuCreateSchema>({
    resolver: zodResolver(menuCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      valid_date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    },
  });

  const router = useRouter();
  
  const onSubmit = async (data: MenuCreateSchema) => {
    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      // Incluir todos los campos del formulario, incluido description
      const formattedData = {
        name: data.name,
        valid_date: data.valid_date,
        description: data.description || undefined, // Usamos undefined en vez de null para cumplir con el tipo
      };

      console.log('Enviando datos de menú:', formattedData);
      const menu = await createMenu(formattedData);
      
      if (menu) {
        setSuccessMessage("Menú creado con éxito");
        methods.reset(); // Limpia el formulario
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            // Por defecto, redirigir al listado de menús
            router.push('/dashboard/menus');
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error en formulario:', error);
      setServerError(error.message || 'Error al crear el menú');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-medium">Crear nuevo menú</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <RootInput
              id="name"
              htmlFor="name"
              label="Nombre del Menú *"
              {...methods.register("name")}
              placeholder="Nombre del menú"
              error={methods.formState.errors.name?.message}
            />
          </div>
          <div>
            <RootInput
              id="valid_date"
              htmlFor="valid_date"
              label="Fecha de Validez *"
              type="date"
              {...methods.register("valid_date")}
              error={methods.formState.errors.valid_date?.message}
            />
          </div>
        </div>

        <div>
          <RootInput
            id="description"
            htmlFor="description"
            label="Descripción"
            {...methods.register("description")}
            placeholder="Descripción del menú"
            error={methods.formState.errors.description?.message}
          />
        </div>

        {serverError && (
          <div className="text-red-500 text-sm mt-2">{serverError}</div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm mt-2">{successMessage}</div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Save size={18} />
            Guardar Menú
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
