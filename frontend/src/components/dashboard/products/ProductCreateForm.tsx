"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormWrapper } from "@/components/ui";
import { Form } from "@/components/ui/Form";
import { RootInput } from "@/components/ui/root-input";
import { Button } from "@/components/ui/Buttons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { SystemAlert } from "@/components/ui/system-alert";
import { Loader2, CheckCircle, XCircle, Plus, Save, PlusCircle } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ToggleButton } from "@/components/ui/ToggleButton";
import { useAuthStore } from "@/lib/auth";
import { getAuthToken } from "@/lib/api";

// Definir el esquema de validación con Zod
const productSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  description: z
    .string()
    .max(200, "La descripción no puede exceder los 200 caracteres")
    .optional()
    .or(z.literal("")),
  price: z
    .number({ invalid_type_error: "El precio debe ser un número" })
    .min(0.01, "El precio debe ser mayor a 0"),
  // Campo de imagen eliminado temporalmente por errores en la API
  is_available: z.boolean().default(true),
  category_id: z.number({
    invalid_type_error: "Debe seleccionar una categoría",
  }),
});

// Tipo inferido del esquema
type ProductFormValues = z.infer<typeof productSchema>;

export function ProductCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const { createProduct } = useProducts();
  const { categories, fetchCategories, createCategory } = useCategories();
  const { user } = useAuthStore();

  // Cargar categorías para el selector
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Configurar react-hook-form con validación de Zod
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      // image: "", // Campo eliminado temporalmente
      is_available: true,
      category_id: undefined as any,
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
  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setServerError(null);
    setLoading(true);

    try {
      // Obtener el ID del usuario actual para el created_by
      const userId = user?.id;

      // Crear un objeto con los campos específicos requeridos por la API
      // Usando exactamente el esquema que espera el endpoint
      const payload = {
        name: data.name,
        description: data.description || null, // API espera string | null
        // Asegurarnos de que price sea un número válido y positivo
        price:
          typeof data.price === "number"
            ? data.price
            : parseFloat(String(data.price)),
        // API espera is_available como boolean | null
        is_available:
          data.is_available === undefined ? null : Boolean(data.is_available),
        // Asegurarnos de que category_id sea un número entero válido
        category_id:
          typeof data.category_id === "number"
            ? Math.floor(data.category_id) // Garantizar que sea entero
            : parseInt(String(data.category_id), 10),
        // Incluir created_by como null para cumplir con esquema
        created_by: userId || null,
        // Agregar campo image con valor null como se indica en el esquema
        image: null,
      };

      // Validación adicional para evitar errores 422
      if (isNaN(payload.price) || payload.price <= 0) {
        setServerError("El precio debe ser un número válido mayor que cero");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Validar longitud del nombre según esquema (2-100 caracteres)
      if (
        !payload.name ||
        payload.name.length < 2 ||
        payload.name.length > 100
      ) {
        setServerError("El nombre debe tener entre 2 y 100 caracteres");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      if (isNaN(payload.category_id) || payload.category_id <= 0) {
        setServerError("Debe seleccionar una categoría válida");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Verificar token de autenticación para depuración
      const authToken = getAuthToken();
      console.log("Token de autorización disponible:", !!authToken);
      if (authToken) {
        // Mostrar primeros y últimos caracteres para verificar que no esté truncado
        console.log(
          "Primeros caracteres del token:",
          authToken.substring(0, 15)
        );
        console.log(
          "Últimos caracteres del token:",
          authToken.substring(authToken.length - 15)
        );
      }

      // Log detallado del payload con tipos de datos para diagnóstico
      console.log("Enviando payload:", payload);
      console.log("Tipos de datos del payload:", {
        name: typeof payload.name,
        name_length: payload.name.length,
        description: typeof payload.description,
        price: typeof payload.price,
        price_value: payload.price,
        is_available: typeof payload.is_available,
        is_available_value: payload.is_available,
        category_id: typeof payload.category_id,
        category_id_value: payload.category_id,
        created_by: typeof payload.created_by,
        created_by_value: payload.created_by,
      });

      // Log del payload en formato JSON tal como se envía al servidor
      console.log("Payload JSON:", JSON.stringify(payload));

      try {
        // Usar opción para forzar el token actual
        const result = await createProduct(payload);
        console.log("Respuesta de creación:", result);

        if (!result) {
          setServerError(
            "Error al crear el producto - No se recibió respuesta"
          );
          setShowAlert(true);
          setLoading(false);
          return;
        }

        // Si llegamos aquí, significa que todo salió bien
        reset();
        setSuccessAlert(true);
        setShowAlert(true);
        setLoading(false);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error al crear producto:", error);
        setServerError(
          error instanceof Error
            ? error.message
            : "Error desconocido al crear el producto"
        );
        setShowAlert(true);
        setLoading(false);
      }
    } catch (err: any) {
      setServerError(err?.message || "Error de red");
      setShowAlert(true);
      setLoading(false);
    }
  };

  // Función para crear una nueva categoría
  const handleCreateCategory = async () => {
    // Validar el nombre de la categoría
    if (!newCategoryName || newCategoryName.trim().length < 2) {
      setServerError("El nombre de la categoría debe tener al menos 2 caracteres");
      setShowAlert(true);
      return;
    }

    setCreatingCategory(true);
    
    try {
      // Llamar a la API para crear la categoría
      const result = await createCategory({
        name: newCategoryName.trim(),
        is_active: true
      });

      if (result) {
        // Actualizar la lista de categorías
        await fetchCategories();
        
        // Seleccionar la nueva categoría
        setValue("category_id", result.id);
        
        // Limpiar el formulario y cerrar
        setNewCategoryName("");
        setShowCategoryModal(false);
      } else {
        setServerError("No se pudo crear la categoría");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
      setServerError(error instanceof Error ? error.message : "Error al crear la categoría");
      setShowAlert(true);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Obtener el estado del toggle de disponibilidad para mostrar el ícono adecuado
  const isAvailable = watch("is_available");

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={successAlert ? "Producto creado" : "Error al crear producto"}
        description={
          successAlert
            ? "El producto se creó correctamente."
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
        title="Crear producto"
        subtitle="Complete el formulario para crear un nuevo producto"
      >
        {/* Modal para crear nueva categoría */}
        <SystemAlert
          open={showCategoryModal}
          setOpen={setShowCategoryModal}
          title="Nueva categoría"
          description="Ingrese el nombre para la nueva categoría"
          confirmText="Guardar"
          cancelText="Cancelar"
          onConfirm={handleCreateCategory}
          onCancel={() => {
            setNewCategoryName("");
            setShowCategoryModal(false);
          }}
          customContent={
            <div className="px-2">
              <RootInput
                label="Nombre de la categoría"
                htmlFor="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej: Bebidas, Postres, etc."
                className="w-full"
                autoFocus
              />
            </div>
          }
        />
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
              placeholder="Ej: Café Americano"
            />

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24"
                placeholder="Descripción del producto"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-end justify-center gap-4 flex-wrap w-full h-16 ">
              <RootInput
                label="Precio"
                htmlFor="price"
                type="number"
                step="0.01"
                min="0"
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
                placeholder="Ej: 5.99"
              />

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="text-sm font-medium"
                    htmlFor="category_id"
                  >
                    Categoría
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs flex items-center gap-1"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <PlusCircle size={14} />
                    <span>Nueva</span>
                  </Button>
                </div>
                
                <Select
                  onValueChange={(value) =>
                    setValue("category_id", parseInt(value, 10))
                  }
                  defaultValue=""
                >
                  <SelectTrigger id="category_id" className="w-full">
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <ToggleButton
                  id="is_available"
                  checked={isAvailable}
                  onCheckedChange={(checked: boolean) =>
                    setValue("is_available", checked)
                  }
                  activeIcon={
                    <CheckCircle
                      size={16}
                      className="text-secondary-foreground"
                    />
                  }
                  inactiveIcon={<XCircle size={16} className="text-red-500" />}
                  activeText="Producto disponible"
                  inactiveText="Producto no disponible"
                />
              </div>
            </div>

            {/* Campo de imagen eliminado temporalmente */}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="ml-2">Creando producto...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2" />
                  Crear producto
                </>
              )}
            </Button>
            <Separator />
          </form>
        </Form>
      </FormWrapper>
    </>
  );
}
