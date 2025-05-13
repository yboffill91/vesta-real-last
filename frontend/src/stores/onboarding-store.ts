import { create } from 'zustand'
import { onboardingService, OnboardingCheckResponse } from '@/services/onboarding'

interface OnboardingState {
  // Status flags
  needsSetup: boolean
  hasAdminUser: boolean
  hasEstablishmentConfig: boolean
  isLoading: boolean
  
  // Current step
  currentStep: number
  
  // Actions
  checkOnboardingStatus: () => Promise<OnboardingCheckResponse>
  setCurrentStep: (step: number) => void
  reset: () => void
}

const initialState = {
  needsSetup: false,
  hasAdminUser: false,
  hasEstablishmentConfig: false,
  isLoading: false,
  currentStep: 1
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,
  
  /**
   * Check if the system requires onboarding
   */
  checkOnboardingStatus: async () => {
    set({ isLoading: true })
    
    try {
      // Call the onboarding service
      const status = await onboardingService.checkOnboardingStatus()
      
      // Update state with results
      set({
        needsSetup: status.needsSetup,
        hasAdminUser: status.hasAdminUser,
        hasEstablishmentConfig: status.hasEstablishmentConfig,
        isLoading: false
      })
      
      // Determine the starting step based on what needs to be configured
      if (status.needsSetup) {
        if (!status.hasAdminUser) {
          set({ currentStep: 1 }) // Start with admin user creation
        } else if (!status.hasEstablishmentConfig) {
          set({ currentStep: 2 }) // Start with establishment configuration
        }
      }
      
      return status
    } catch (error) {
      console.error('Error in checking onboarding status:', error)
      set({ isLoading: false })
      
      // Return default failure status
      return {
        needsSetup: true,
        hasAdminUser: false,
        hasEstablishmentConfig: false
      }
    }
  },
  
  /**
   * Set the current onboarding step
   */
  setCurrentStep: (step: number) => {
    set({ currentStep: step })
  },
  
  /**
   * Reset the onboarding state
   */
  reset: () => {
    set(initialState)
  }
}))
