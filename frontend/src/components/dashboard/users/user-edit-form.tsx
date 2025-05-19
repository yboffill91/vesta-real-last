"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardContent, FormWrapper } from "@/components/ui";
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
import { useUser, useUpdateUser } from "@/hooks/use-user";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/models/User.types";

const userEditSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(32),
    surname: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(32),
    username: z
      .string()
      .min(4, "El usuario debe tener al menos 4 caracteres")
      .max(32),
    role: z.enum(["Soporte", "Administrador", "Dependiente"], {
      required_error: "El rol es obligatorio",
    }),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .optional()
      .or(z.literal("")),
    repeatPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password || data.repeatPassword) {
        return (
          data.password === data.repeatPassword && data.password.length >= 6
        );
      }
      return true;
    },
    {
      message:
        "Las contraseñas no coinciden o son demasiado cortas (mínimo 6 caracteres)",
      path: ["repeatPassword"],
    }
  );

type UserEditFormValues = z.infer<typeof userEditSchema>;

type Props = {
  userId: string | number;
  onSuccess?: () => void;
};

export function UserEditForm({ userId, onSuccess }: Props) {
  const { user, loading: loadingUser, error: errorUser } = useUser(userId);
  const {
    updateUser,
    loading: updating,
    error: errorUpdate,
    success,
  } = useUpdateUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const router = useRouter();

  const methods = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      role: "Administrador",
      password: "",
      repeatPassword: "",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = methods;

  // Cargar datos del usuario al obtenerlos
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        surname: user.surname || "",
        username: user.username || "",
        role: user.role as UserEditFormValues["role"],
        password: "",
        repeatPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserEditFormValues) => {
    setServerError(null);
    // Solo incluir password si se provee
    const payload: any = {
      id: Number(userId),
      name: data.name,
      surname: data.surname,
      username: data.username,
      role: data.role,
    };
    if (data.password && data.password.length >= 6) {
      payload.password = data.password;
    }
    const ok = await updateUser(userId, payload);
    if (!ok) {
      setServerError(errorUpdate || "No se pudo actualizar el usuario");
      setShowAlert(true);
      return;
    }
    setSuccessAlert(true);
    setShowAlert(true);
    if (onSuccess) onSuccess();
    // Redirecciona después de éxito
    setTimeout(() => {
      router.push("/dashboard/users");
    }, 1200);
  };

  return (
    <>
      <SystemAlert
        open={showAlert}
        setOpen={setShowAlert}
        title={
          successAlert ? "Usuario actualizado" : "Error al actualizar usuario"
        }
        description={
          successAlert
            ? "El usuario se actualizó correctamente."
            : serverError ||
              errorUser ||
              errorUpdate ||
              "Ocurrió un error inesperado."
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
        title="Editar usuario"
        subtitle="Modifica los datos del usuario seleccionado"
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
              placeholder="Ej: Juan Manuel"
              disabled={loadingUser}
            />
            <RootInput
              label="Apellido"
              htmlFor="surname"
              error={errors.surname?.message}
              {...register("surname")}
              placeholder="Ej: Perez Martinez"
              disabled={loadingUser}
            />
            <RootInput
              label="Usuario"
              htmlFor="username"
              error={errors.username?.message}
              {...register("username")}
              placeholder="ej: juan.perez"
              disabled={loadingUser}
            />
            <div className="grid md:grid-cols-2 gap-8">
              <RootInput
                label="Nueva contraseña"
                htmlFor="password"
                type="password"
                error={errors.password?.message}
                {...register("password")}
                placeholder="Dejar vacío para no cambiar"
                disabled={loadingUser}
              />
              <RootInput
                label="Repetir contraseña"
                htmlFor="repeatPassword"
                type="password"
                error={errors.repeatPassword?.message}
                {...register("repeatPassword")}
                placeholder="Vuelve a escribir la nueva contraseña"
                disabled={loadingUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="role">
                Rol
              </label>
              <Select
                value={watch("role") || ""}
                onValueChange={(value) =>
                  setValue("role", value as UserEditFormValues["role"])
                }
                name="role"
                disabled={loadingUser}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
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
              disabled={isSubmitting || updating || loadingUser}
            >
              {isSubmitting || updating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="ml-2">Actualizando usuario...</span>
                </>
              ) : (
                "Actualizar usuario"
              )}
            </Button>
            <Separator />
          </form>
        </Form>
      </FormWrapper>
    </>
  );
}
