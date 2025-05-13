"use client"

import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { SystemAlert } from '@/components/system-alert'
import { useOnboardingStore } from '@/stores/onboarding-store'

interface ConfirmationStepProps {
  onComplete: () => void
}

type SetupStatus = {
  adminUser: {
    exists: boolean
    username?: string
    email?: string
  }
  establishment: {
    exists: boolean
    name?: string
    legalName?: string
  }
}

export function ConfirmationStep({ onComplete }: ConfirmationStepProps) {
  const { checkOnboardingStatus } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  useEffect(() => {
    const fetchSetupStatus = async () => {
      setIsLoading(true)
      
      try {
        // Get admin user info
        const adminResponse = await fetchApi('/api/v1/admin/info')
        const adminData = adminResponse.data || {}
        
        // Get establishment info
        const establishmentResponse = await fetchApi('/api/v1/establishment/info')
        const establishmentData = establishmentResponse.data || {}
        
        setSetupStatus({
          adminUser: {
            exists: !!adminData.username,
            username: adminData.username,
            email: adminData.email
          },
          establishment: {
            exists: !!establishmentData.name,
            name: establishmentData.name,
            legalName: establishmentData.legalName
          }
        })
      } catch (err) {
        console.error('Error fetching setup status:', err)
        setError('No se pudo obtener la información de configuración')
        setShowErrorAlert(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSetupStatus()
  }, [])

  const handleFinish = async () => {
    try {
      // Perform a final check before completing
      await checkOnboardingStatus()
      
      // Complete the setup process
      onComplete()
    } catch (err) {
      console.error('Error completing setup:', err)
      setError('Error al finalizar el proceso de configuración')
      setShowErrorAlert(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Verificando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SystemAlert
        open={showErrorAlert}
        setOpen={setShowErrorAlert}
        title="Error en la verificación"
        description={error || 'Ha ocurrido un error al verificar la configuración'}
        confirmText="Aceptar"
        variant="destructive"
      />

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Configuración Completada</h3>
        <p className="text-sm text-muted-foreground">
          ¡Felicidades! Ha completado la configuración inicial del sistema.
          A continuación se muestra un resumen de la configuración.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <h4 className="font-medium">Usuario Administrador</h4>
            {setupStatus?.adminUser.exists ? (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-3 w-3" />
              </span>
            )}
          </div>
          
          {setupStatus?.adminUser.exists && (
            <div className="ml-6 space-y-1 text-sm">
              <p><span className="font-medium">Usuario:</span> {setupStatus.adminUser.username}</p>
              <p><span className="font-medium">Email:</span> {setupStatus.adminUser.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <h4 className="font-medium">Establecimiento</h4>
            {setupStatus?.establishment.exists ? (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-3 w-3" />
              </span>
            )}
          </div>
          
          {setupStatus?.establishment.exists && (
            <div className="ml-6 space-y-1 text-sm">
              <p><span className="font-medium">Nombre Comercial:</span> {setupStatus.establishment.name}</p>
              <p><span className="font-medium">Razón Social:</span> {setupStatus.establishment.legalName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleFinish} className="w-full">
          Comenzar a Usar el Sistema
        </Button>
      </div>
    </div>
  )
}
