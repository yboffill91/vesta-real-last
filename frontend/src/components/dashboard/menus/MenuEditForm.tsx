"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMenus } from "@/hooks/useMenus";
import { Button, RootInput, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { Save, ArrowLeft, Copy } from "lucide-react";
import { Menu } from "@/models/menu";

// Definición del esquema de validación con Zod
const menuEditSchema = z.object({
  name: z.string().min(1, "El nombre del menú es requerido"),
  description: z.string().optional(),
  valid_date: z.string().min(1, "La fecha de validez es requerida"),
});

type MenuEditSchema = z.infer<typeof menuEditSchema>;

interface MenuEditFormProps {
  menuId: number;
  onSuccess?: () => void;
}

export function MenuEditForm({ menuId, onSuccess }: MenuEditFormProps) {
  const { updateMenu, getMenuById, duplicateMenu, error } = useMenus();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<Menu | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const methods = useForm<MenuEditSchema>({
    resolver: zodResolver(menuEditSchema),
    defaultValues: {
      name: "",
      description: "",
      valid_date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    },
  });

  const router = useRouter();

  // Cargar datos del menú al iniciar
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menu = await getMenuById(menuId);
        if (menu) {
          setMenuData(menu);

          // Actualizar valores del formulario
          methods.reset({
            name: menu.name,
            description: menu.description || "",
            valid_date:
              menu.valid_date || new Date().toISOString().split("T")[0],
          });
        } else {
          setServerError("No se encontró el menú especificado");
        }
      } catch (error: any) {
        setServerError(error.message || "Error al cargar el menú");
      } finally {
        setInitialLoading(false);
      }
    };

    loadMenu();
  }, [menuId, getMenuById, methods]);

  const onSubmit = async (data: MenuEditSchema) => {
    if (!menuData) return;

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

      console.log("Enviando datos de actualización de menú:", formattedData);
      const updatedMenu = await updateMenu(menuId, formattedData);

      if (updatedMenu) {
        setSuccessMessage("Menú actualizado con éxito");
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            // Por defecto, redirigir al listado de menús
            router.push("/dashboard/menus");
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error en formulario:", error);
      setServerError(error.message || "Error al actualizar el menú");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/menus");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        Cargando datos del menú...
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        className="p-2"
      >
        <ArrowLeft size={18} />
        Volver a Menús
      </Button>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-medium">Editar menú</h2>
        </div>

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

        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Copy size={18} />
                Duplicar Menú
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Duplicar Menú</AlertDialogTitle>
                <AlertDialogDescription>
                  Se creará una copia del menú con todos sus productos. La copia tendrá la fecha de validez de mañana y estará en estado borrador.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  setLoading(true);
                  try {
                    const duplicatedMenu = await duplicateMenu(menuId);
                    if (duplicatedMenu) {
                      setSuccessMessage("Menú duplicado exitosamente");
                      setTimeout(() => {
                        router.push(`/dashboard/menus/edit/${duplicatedMenu.id}`);
                      }, 1000);
                    }
                  } catch (error) {
                    setServerError("Error al duplicar el menú");
                  } finally {
                    setLoading(false);
                  }
                }}>Duplicar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            type="submit"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
