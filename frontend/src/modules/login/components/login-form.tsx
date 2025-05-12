"use client"

import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button, FormField, AnimatedInput } from "@/components"
import { useAuthStore } from "@/lib/auth"

// Esquema de validación
const loginSchema = z.object({
  username: z
    .string()
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
    .regex(/^[a-zA-Z0-9_@.]+$/, "Solo se permiten letras, números, guiones bajos, @ y ."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
    // Las validaciones de mayúsculas/minúsculas/números son opcionales para desarrollo
    // .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    // .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    // .regex(/[0-9]/, "Debe contener al menos un número"),
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
  const router = useRouter()
  const { login } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Cambiado a onBlur para validar solo cuando el usuario sale del input
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setAuthError(null)
      // Usar el store de autenticación para iniciar sesión
      await login(data.username, data.password)
      
      // Si la autenticación es exitosa, redirigir al dashboard
      router.push('/')
    } catch (error) {
      // Mostrar mensaje de error con alert (temporal)
      const message = error instanceof Error ? error.message : 'Error durante la autenticación'
      setAuthError(message)
      alert(`Error de autenticación: ${message}`)
      console.error('Error de autenticación:', error)
    }
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
          className="text-balance text-sm text-muted-foreground w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Ingrese sus credenciales para acceder al sistema
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
