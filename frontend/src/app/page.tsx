"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui";
import { useAuthStore } from "@/lib/auth";

const HomePage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    // Si ya se cargó la autenticación
    if (!authLoading) {
      if (!user) {
        // Si no hay usuario autenticado, redirigir a /auth
        router.replace("/auth");
      } else {
        // Redirigir según el rol del usuario
        const redirectPath = "/dashboard";
        router.replace(redirectPath);
      }
    }
  }, [user, authLoading, router]);

  // Mostrar el loader mientras se verifica la autenticación
  return <Loader message="Iniciando VestaSys..." />;
};

export default HomePage;
