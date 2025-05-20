"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/auth";

export function useTokenAutoRenewal(renewalMinutesBefore: number = 2) {
  const { token, user, login, logout } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [renewalError, setRenewalError] = useState<string | null>(null);
  const [renewalAttempts, setRenewalAttempts] = useState(0);
  const renewalTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Decodifica el JWT para obtener el tiempo de expiración
  function getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  // Programa la renovación automática
  useEffect(() => {
    if (!token || !user) return;
    if (renewalTimeout.current) clearTimeout(renewalTimeout.current);

    const exp = getTokenExpiration(token);
    if (!exp) return;
    const now = Date.now();
    const renewalTime = exp - renewalMinutesBefore * 60 * 1000; // ms
    const delay = renewalTime - now;
    if (delay <= 0) {
      setShowPasswordModal(true);
      return;
    }
    renewalTimeout.current = setTimeout(() => {
      setShowPasswordModal(true);
    }, delay);
    // Limpiar al desmontar
    return () => {
      if (renewalTimeout.current) clearTimeout(renewalTimeout.current);
    };
  }, [token, user, renewalMinutesBefore]);

  // Handler para renovar el token
  async function handleRenew(password: string) {
    setRenewalError(null);
    try {
      if (!user?.username)
        throw new Error("No se encontró el usuario en sesión");
      await login(user.username, password);
      setShowPasswordModal(false);
      setRenewalAttempts(0);
    } catch (err: any) {
      setRenewalAttempts((prev) => prev + 1);
      setRenewalError(err.message || "Error al renovar el token");
      if (renewalAttempts + 1 >= 3) {
        handleCancel();
      }
    }
  }

  // Handler para cancelar (logout y redirigir)
  function handleCancel() {
    setShowPasswordModal(false);
    setRenewalAttempts(0);
    logout();
    router.push("/auth");
  }

  return {
    showPasswordModal,
    renewalError,
    handleRenew,
    handleCancel,
    setShowPasswordModal,
    renewalAttempts,
  };
}
