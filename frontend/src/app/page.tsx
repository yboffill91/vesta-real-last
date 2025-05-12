'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()
  const { user, token, checkAuth, isLoading, logout } = useAuthStore()
  
  const handleLogout = () => {
    logout()
    router.replace('/login')
  }
  
  useEffect(() => {
    const verifyAuthentication = async () => {
      // Si no hay token, redirigir al login
      if (!token) {
        router.replace('/login')
        return
      }
      
      // Si hay token pero no usuario, intentar verificar la autenticación
      if (token && !user) {
        try {
          const isValid = await checkAuth()
          if (!isValid) {
            router.replace('/login')
          }
        } catch (error) {
          console.error('Error al verificar autenticación:', error)
          router.replace('/login')
        }
      }
    }
    
    verifyAuthentication()
  }, [router, token, user, checkAuth])
  
  // Mientras verifica, mostrar un mensaje de carga
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    )
  }
  
  // Si está autenticado, mostrar la página principal
  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-primary p-6 text-primary-foreground">
      <div className="absolute right-4 top-4">
        <Button 
          variant="outline" 
          className="bg-white/10 text-primary-foreground hover:bg-white/20" 
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </div>
      <h1 className="mb-4 text-3xl font-bold">Bienvenido a VestaSys</h1>
      <p className="mb-8 text-center text-xl">
        Sistema de Gestión Integral para Negocios Gastronómicos
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white/10 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-semibold">Menús</h2>
          <p>Gestione los menús y productos disponibles</p>
        </div>
        <div className="rounded-lg bg-white/10 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-semibold">Órdenes</h2>
          <p>Administre las órdenes y pedidos</p>
        </div>
        <div className="rounded-lg bg-white/10 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-semibold">Puestos</h2>
          <p>Controle los puestos de servicio</p>
        </div>
        <div className="rounded-lg bg-white/10 p-6 shadow-md backdrop-blur-sm">
          <h2 className="mb-2 text-xl font-semibold">Reportes</h2>
          <p>Visualice métricas y estadísticas</p>
        </div>
      </div>
    </div>
  )
}