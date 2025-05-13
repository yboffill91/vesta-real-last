"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useAuthStore } from '@/lib/auth'

/**
 * OnboardingCheck component
 * 
 * This component checks if the system needs initial setup after user login
 * and redirects to the appropriate route based on onboarding status.
 * It should be placed in the dashboard layout or root layout to run after authentication.
 */
export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { checkOnboardingStatus, needsSetup, isLoading } = useOnboardingStore()
  const [checkComplete, setCheckComplete] = useState(false)

  useEffect(() => {
    // Only check onboarding status if user is logged in
    // and specifically for 'soporte' user
    if (user && user.username === 'soporte') {
      const checkSetup = async () => {
        // Get onboarding status from the API
        const status = await checkOnboardingStatus()

        // Redirect based on the status
        if (status.needsSetup) {
          router.replace('/setup')
        } else {
          // If no setup needed, allow rendering of children
          setCheckComplete(true)
        }
      }

      checkSetup()
    } else {
      // For regular users, no need for setup check
      setCheckComplete(true)
    }
  }, [user, checkOnboardingStatus, router])

  // Show nothing while checking
  if (user && user.username === 'soporte' && !checkComplete && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Render children only after check is complete
  return <>{children}</>
}
