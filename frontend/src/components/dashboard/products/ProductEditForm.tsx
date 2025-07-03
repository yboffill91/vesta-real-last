"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2, CheckCircle, XCircle, ArrowLeft, Save, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/models/product";
import { ToggleButton } from "@/components/ui/ToggleButton";

// Definir explícitamente el tipo de los valores del formulario para evitar problemas de tipado
type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
  category_id: number;
};

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
  image: z
    .string()
    .max(500, "La URL de la imagen no puede exceder los 500 caracteres")
    .optional()
    .or(z.literal("")),
  is_available: z.boolean().default(true),
  category_id: z.number({
    invalid_type_error: "Debe seleccionar una categoría",
  }),
});

export function ProductEditForm({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  const router = useRouter();

  const { getProductById, updateProduct } = useProducts();
  const { categories, fetchCategories, createCategory } = useCategories();

  // Configurar react-hook-form con validación de Zod
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    mode: "onBlur",
    // Los valores por defecto se establecerán después de cargar el producto
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = methods;

  // Cargar categorías para el selector y el producto a editar
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);

        // Cargar categorías
        await fetchCategories();

        // Cargar datos del producto
        const productData = await getProductById(productId);

        if (productData) {
          setProduct(productData);

          // Establecer los valores del formulario
          reset({
            name: productData.name,
            description: productData.description || "",
            price: productData.price,
            image: productData.image || "",
            is_available: productData.is_available,
            category_id: productData.category_id,
          });
        } else {
          setServerError("No se encontró el producto");
          setShowAlert(true);
        }
      } catch (error: any) {
        setServerError(error.message || "Error al cargar los datos");
        setShowAlert(true);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [productId, getProductById, fetchCategories, reset]);

  // Función de envío del formulario
  const onSubmit = async (data: ProductFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const result = await updateProduct(productId, {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        is_available: data.is_available,
        category_id: data.category_id,
      });

      if (!result) {
        setServerError("Error al actualizar el producto");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Éxito
      setSuccessAlert(true);
      setShowAlert(true);
      setLoading(false);
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

  const isAvailable = watch("is_available");

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={successAlert ? "Producto actualizado" : "Error"}
        description={
          successAlert
            ? "El producto se actualizó correctamente."
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
        title={`Editar producto: ${product?.name || ""}`}
        subtitle="Modifique los datos del producto"
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
          {initialLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : (
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
                <label
                  className="text-sm font-medium mb-1"
                  htmlFor="description"
                >
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

              <div className="flex items-end justify-center gap-2 w-full h-24">
                <div className="w-1/3">
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
                </div>

                <div className="flex flex-col w-1/3">
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
                    defaultValue={product?.category_id?.toString()}
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
                <div className="flex items-center space-x-2 w-1/3">
                  <ToggleButton
                    id="is_available"
                    checked={isAvailable}
                    onCheckedChange={(checked: boolean) =>
                      setValue("is_available", checked)
                    }
                    activeIcon={<CheckCircle size={16} />}
                    inactiveIcon={<XCircle size={16} />}
                    activeText="Producto disponible"
                    inactiveText="Producto no disponible"
                  />
                </div>
              </div>

              <RootInput
                label="URL de la imagen"
                htmlFor="image"
                error={errors.image?.message}
                {...register("image")}
                placeholder="https://ejemplo.com/imagen.jpg"
              />

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
                  <>
                    <Save /> Actualizar Producto
                  </>
                )}
              </Button>
              <Separator />
            </form>
          )}
        </Form>
      </FormWrapper>
    </>
  );
}
