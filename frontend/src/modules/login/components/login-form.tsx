"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button, FormField, AnimatedInput } from "@/components"


// Esquema de validación separado para mejor mantenibilidad
const loginSchema = z.object({
  username: z
    .string()
    .min(6, "El nombre de usuario debe tener al menos 6 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
})

type LoginFormValues = z.infer<typeof loginSchema>

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
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Cambiado a onBlur para validar solo cuando el usuario sale del input
  })

  const onSubmit = async (data: LoginFormValues) => {
    // Simulando un envío de formulario
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Aquí iría la lógica de autenticación
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <motion.div className="flex flex-col items-center gap-2 text-center" variants={itemVariants}>
        <motion.h1
          className="text-2xl font-bold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Iniciar sesión
        </motion.h1>
        <motion.p
          className="text-balance text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Ingrese su nombre de usuario para acceder al sistema
        </motion.p>
      </motion.div>
      <motion.div className="grid gap-6" variants={itemVariants}>
        <FormField label="Nombre de usuario" htmlFor="username" error={errors.username?.message}>
          <AnimatedInput
            id="username"
            type="text"
            placeholder="usuario123"
            error={errors.username?.message}
            {...register("username")}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <AnimatedInput id="password" type="password" error={errors.password?.message} {...register("password")} />
        </FormField>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Iniciar sesión"}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  )
}
