"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SystemAlert } from '@/components/system-alert'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { establishmentSchema, EstablishmentFormValues } from '@/lib/schema/establishment'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'


interface EstablishmentStepProps {
  onComplete: () => void
}

export function EstablishmentStep({ onComplete }: EstablishmentStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [success, setSuccess] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<EstablishmentFormValues>({
    mode: 'onBlur',
    
  })

  // Maneja la carga y almacenamiento local del logo
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('El logo debe ser una imagen JPEG, PNG o WEBP');
      setShowErrorAlert(true);
      form.setValue('logo', '');
      setLogoPreview(null);
      return;
    }
    // Guardar el archivo en /public/logos
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const publicPath = `/logos/${fileName}`;
    // Usar FileReader para preview
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    // No hay API para guardar en public desde frontend puro, así que se asume que el backend debe aceptar multipart o bien se simula el guardado (solo ruta)
    form.setValue('logo', publicPath);
    // Si quieres realmente subir el archivo, deberías hacerlo aquí con un endpoint de subida
  };

  const router = useRouter();

  const onSubmit = async (data: EstablishmentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setShowErrorAlert(false);

    const response = await fetchApi('/api/v1/establishment/', {
      method: 'POST',
      body: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        logo: data.logo,
        tax_rate: data.tax_rate,
        currency: data.currency,
        is_configured: false
      }
    });

    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
        onComplete();
      }, 1000);
    } else {
      setError(response.error || 'No se pudo crear la configuración del establecimiento.');
      setShowErrorAlert(true);
    }
    setIsSubmitting(false);
  }

  const { setCurrentStep } = useOnboardingStore()

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
        <h3 className="text-lg font-medium flex items-center gap-2">
          Configuración del Establecimiento
          {success && <Check className="text-green-500 w-6 h-6 animate-bounce" />}
        </h3>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de su establecimiento. Estos datos serán usados en los
          comprobantes, facturas y reportes del sistema.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Restaurante El Buen Sabor" {...field} />
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
                    <Input placeholder="Ej: +53 55555555" {...field} />
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
                  <Textarea placeholder="Ej: Av. Principal #123, Ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2 items-end">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo del Establecimiento</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                    />
                  </FormControl>
                  {logoPreview && (
                    <div className="mt-2">
                      <img src={logoPreview} alt="Vista previa del logo" className="max-h-20 rounded border" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impuesto (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field} defaultValue={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Campo oculto para is_configured */}
          <input type="hidden" {...form.register('is_configured')} value="false" />

          <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? 'Guardando configuración...' : 'Guardar Configuración del Establecimiento'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
