import { fetchApi } from '@/lib/api'

export type OnboardingCheckResponse = {
  needsSetup: boolean
  hasAdminUser: boolean
  hasEstablishmentConfig: boolean
}

/**
 * Service for handling onboarding-related API calls
 */
export const onboardingService = {
  /**
   * Check if system requires onboarding setup
   * @returns Promise with onboarding check results
   */
  async checkOnboardingStatus(): Promise<OnboardingCheckResponse> {
    try {
      // Check if admin user exists
      const adminResponse = await fetchApi('/api/v1/admin/check')
      const hasAdminUser = adminResponse.data?.exists || false
      
      // Check if establishment configuration exists
      const establishmentResponse = await fetchApi('/api/v1/establishment/exists')
      const hasEstablishmentConfig = establishmentResponse.data?.exists || false
      
      // System needs setup if either admin user or establishment config is missing
      const needsSetup = !hasAdminUser || !hasEstablishmentConfig
      
      return {
        needsSetup,
        hasAdminUser,
        hasEstablishmentConfig
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // If there's an error, assume setup is needed
      return {
        needsSetup: true,
        hasAdminUser: false,
        hasEstablishmentConfig: false
      }
    }
  }
}
