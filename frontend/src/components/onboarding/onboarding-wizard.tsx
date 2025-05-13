"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

// Import step components
import { AdminUserStep, EstablishmentStep, ConfirmationStep } from './steps'

// Step configuration
const steps = [
  { id: 1, title: 'Crear Usuario Administrador' },
  { id: 2, title: 'Configurar Establecimiento' },
  { id: 3, title: 'Confirmación' }
]

export function OnboardingWizard() {
  const router = useRouter()
  const { currentStep, setCurrentStep, needsSetup, hasAdminUser, hasEstablishmentConfig } = useOnboardingStore()
  const [progress, setProgress] = useState(0)

  // Update progress based on current step
  useEffect(() => {
    const currentProgress = (currentStep / steps.length) * 100
    setProgress(currentProgress)
  }, [currentStep])

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle wizard completion
  const handleComplete = () => {
    // Reset onboarding state and navigate to dashboard
    router.replace('/dashboard')
  }

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AdminUserStep onComplete={handleNext} />
      case 2:
        return <EstablishmentStep onComplete={handleNext} />
      case 3:
        return <ConfirmationStep onComplete={handleComplete} />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-3xl py-10 mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Configuración Inicial del Sistema
          </CardTitle>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              {steps.map((step) => (
                <div key={step.id} className={`flex items-center ${currentStep >= step.id ? 'text-primary' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${currentStep > step.id ? 'bg-primary text-white' : currentStep === step.id ? 'border-2 border-primary' : 'border-2 border-muted'}`}>
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className={`hidden sm:inline ${currentStep >= step.id ? 'font-medium' : ''}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} className="flex items-center">
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="flex items-center">
              Completar
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
