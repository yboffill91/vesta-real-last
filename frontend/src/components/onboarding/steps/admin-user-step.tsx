"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SystemAlert } from '@/components/system-alert'
import { adminUserSchema, AdminUserFormValues } from '@/lib/schema/admin-user'
import { Check } from 'lucide-react'




interface AdminUserStepProps {
  onComplete: () => void
}

export function AdminUserStep({ onComplete }: AdminUserStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  const [success, setSuccess] = useState(false)
  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: AdminUserFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Call API to create admin user
      // Autogenerar username: nombre.apellidos (minúsculas, sin espacios)
      
     
     
      const response = await fetchApi('/api/v1/users/', {
        method: 'POST',
        body: {
          name: data.first_name,
          surname: data.last_name,
          username: data.username,
          password: data.password,
          role: 'Administrador'
        },
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setError(response.error || 'No se pudo crear el usuario.');
        setShowErrorAlert(true);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SystemAlert
        open={showErrorAlert}
        setOpen={setShowErrorAlert}
        title="Error en la creación de usuario"
        description={error || 'Ha ocurrido un error al crear el usuario administrador'}
        confirmText="Aceptar"
        variant="destructive"
      />

      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          Crear Usuario Administrador
          {success && <Check className="text-green-500 w-6 h-6 animate-bounce" />}
        </h3>
        <p className="text-sm text-muted-foreground">
          Para comenzar a usar el sistema, es necesario crear un usuario administrador
          que tendrá acceso completo a todas las funcionalidades.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre(s)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Carlos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pérez Gómez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: juan.perez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repetir Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? 'Creando usuario...' : 'Crear Usuario Administrador'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
