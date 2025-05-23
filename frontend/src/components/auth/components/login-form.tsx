"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, RootInput, SystemAlert, Separator } from "@/components/ui";
import { useAuthStore } from "@/lib/auth";
import { Loader } from "@/components/ui/loader";
import { Loader2 } from "lucide-react";

// Esquema de validación
const loginSchema = z.object({
  username: z
    .string()
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Solo se permiten letras, números, guiones bajos, puntos y guiones"
    ),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Variantes de animación
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

import { Form } from "@/components/ui/Form";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Cambiado a onBlur para validar solo cuando el usuario sale del input
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    setShowErrorAlert(false);
    setOnboardingLoading(false);

    try {
      await login(data.username, data.password);
      const { error, user } = useAuthStore.getState();
      if (error) {
        setAuthError(error);
        setShowErrorAlert(true);
        return;
      }
      // Redirigir según el rol del usuario
      if (user?.role === "Soporte") {
        router.replace("/dashboard");
      } else if (user?.role === "Administrador") {
        router.replace("/dashboard/admin");
      } else if (user?.role === "Dependiente") {
        router.replace("/dependientes");
      } else {
        // Rol no reconocido, redirigir a la página por defecto
        router.replace("/");
      }
    } catch (err: any) {
      setAuthError(err.message || "Error durante la autenticación");
      setShowErrorAlert(true);
    }
  };

  return (
    <>
      {(isLoading || onboardingLoading) && (
        <Loader message="Comprobando acceso..." />
      )}
      <SystemAlert
        open={showErrorAlert}
        setOpen={setShowErrorAlert}
        title="Error de autenticación"
        description="Ha ocurrido un error al intentar iniciar sesión"
        confirmText="Reintentar"
        variant="destructive"
      />

      <motion.h1
        className="text-2xl font-bold"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Iniciar sesión
      </motion.h1>
      <motion.p
        className="text-balance text-sm text-muted-foreground w-full mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Ingrese sus credenciales para acceder al sistema
      </motion.p>

      <Form
        {...{
          ...useForm<LoginFormValues>({
            resolver: zodResolver(loginSchema),
            mode: "onBlur",
          }),
        }}
      >
        <form
          className={cn("flex flex-col gap-6", className)}
          onSubmit={handleSubmit(onSubmit)}
          {...props}
        >
          <RootInput
            id="username"
            type="text"
            placeholder="usuario"
            error={errors.username?.message}
            label="Nombre de usuario"
            htmlFor="username"
            {...register("username")}
          />
          <RootInput
            id="password"
            type="password"
            error={errors.password?.message}
            placeholder="********"
            {...register("password")}
            htmlFor="password"
            label="Contraseña"
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="ml-2">Procesando...</span>
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
          <Separator />
        </form>
      </Form>
    </>
  );
}
