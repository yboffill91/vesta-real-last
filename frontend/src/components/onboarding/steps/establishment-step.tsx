"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SystemAlert } from '@/components/system-alert'
import { useOnboardingStore } from '@/stores/onboarding-store'

// Form validation schema
const establishmentSchema = z.object({
  name: z.string().min(3, 'El nombre del establecimiento debe tener al menos 3 caracteres'),
  legalName: z.string().min(3, 'La razón social debe tener al menos 3 caracteres'),
  taxId: z.string().min(5, 'El RNC/Identificación fiscal debe tener al menos 5 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  email: z.string().email('Ingrese un correo electrónico válido').optional().or(z.literal('')),
  website: z.string().url('Ingrese una URL válida').optional().or(z.literal('')),
  logo: z.string().optional()
})

type EstablishmentFormValues = z.infer<typeof establishmentSchema>

interface EstablishmentStepProps {
  onComplete: () => void
}

export function EstablishmentStep({ onComplete }: EstablishmentStepProps) {
  const { setCurrentStep } = useOnboardingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: {
      name: '',
      legalName: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: ''
    }
  })

  const onSubmit = async (data: EstablishmentFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Call API to create establishment
      await fetchApi('/api/v1/establishment/create', { method: 'POST', body: data })

      // Move to next step
      onComplete()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la configuración del establecimiento'
      setError(errorMessage)
      setShowErrorAlert(true)
      console.error('Error creating establishment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SystemAlert
        open={showErrorAlert}
        setOpen={setShowErrorAlert}
        title="Error en la configuración"
        description={error || 'Ha ocurrido un error al configurar el establecimiento'}
        confirmText="Aceptar"
        variant="destructive"
      />

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Configuración del Establecimiento</h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de su establecimiento. Estos datos serán usados en los
          comprobantes, facturas y reportes del sistema.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="Restaurante El Buen Sabor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa S.R.L." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RNC / Identificación Fiscal</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 809-555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea placeholder="Av. Principal #123, Ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Web (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando configuración...' : 'Guardar Configuración del Establecimiento'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
