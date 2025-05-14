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
import { AdminUserStep, EstablishmentStep } from './steps'

// Step configuration
const steps = [
  { id: 1, title: 'Crear Usuario Administrador' },
  { id: 2, title: 'Configurar Establecimiento' }
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

  const StepComponent = steps[currentStep].id === 1 ? AdminUserStep : EstablishmentStep

  // El submit de cada step debe llamar a esta función para avanzar
  const handleCompleteStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Reset onboarding state and navigate to dashboard
      router.replace('/dashboard')
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
              {steps.map((step, idx) => (
                <div key={step.title} className={`flex items-center ${currentStep >= idx ? 'text-primary' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${currentStep > idx ? 'bg-primary text-white' : currentStep === idx ? 'border-2 border-primary' : 'border-2 border-muted'}`}>
                    {/* Paloma verde si el step está completo */}
                    {currentStep > idx ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className={`hidden sm:inline ${currentStep >= idx ? 'font-medium' : ''}`}>
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
              <StepComponent onComplete={handleCompleteStep} />
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
              Completar
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
