"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
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
import { Loader2 } from "lucide-react";
import { SystemAlert } from "@/components/ui/system-alert";
import { fetchApi } from "@/lib/api";

const userSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(32),
  surname: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(32),
  username: z
    .string()
    .min(4, "El usuario debe tener al menos 4 caracteres")
    .max(32),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["Soporte", "Administrador", "Dependiente"], {
    required_error: "El rol es obligatorio",
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

export function UserCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: UserFormValues) => {
    setServerError(null);
    setLoading(true);
    try {
      const { success, error } = await fetchApi("/api/v1/users", {
        method: "POST",
        body: data,
      });
      if (!success) {
        setServerError(error || "Error al crear usuario");
        setShowAlert(true);
        setLoading(false);
        return;
      }
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
        title={successAlert ? "Usuario creado" : "Error al crear usuario"}
        description={
          successAlert
            ? "El usuario se creó correctamente."
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
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Agregar usuario</h2>
          <p className="text-sm text-muted-foreground">
            Complete los datos para crear un nuevo usuario
          </p>
        </CardHeader>
        <CardContent>
          <Form
            {...{
              register,
              handleSubmit,
              formState: { errors, isSubmitting },
              setValue,
              watch,
            }}
          >
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <RootInput
                label="Nombre"
                htmlFor="name"
                error={errors.name?.message}
                {...register("name")}
                placeholder="Ej: Juan Manuel"
              />
              <RootInput
                label="Apellido"
                htmlFor="surname"
                error={errors.surname?.message}
                {...register("surname")}
                placeholder="Ej: Perez Martinez"
              />
              <RootInput
                label="Usuario"
                htmlFor="username"
                error={errors.username?.message}
                {...register("username")}
                placeholder="ej: juan.perez"
              />
              <RootInput
                label="Contraseña"
                htmlFor="password"
                type="password"
                error={errors.password?.message}
                {...register("password")}
                placeholder="************"
              />
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="role"
                >
                  Rol
                </label>
                <Select
                  value={watch("role") || ""}
                  onValueChange={(value) =>
                    setValue("role", value as UserFormValues["role"])
                  }
                  name="role"
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soporte">Soporte</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Dependiente">Dependiente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.role.message}
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
                    <span className="ml-2">Creando usuario...</span>
                  </>
                ) : (
                  "Crear usuario"
                )}
              </Button>
              <Separator />
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
