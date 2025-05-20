"use client";
import { useState } from "react";
import { SystemAlert } from "./system-alert";
import { RootInput } from "./root-input";

interface TokenRenewalAlertProps {
  open: boolean;
  onRenew: (password: string) => void;
  onCancel: () => void;
  error?: string | null;
  attempts: number;
}

export const TokenRenewalAlert: React.FC<TokenRenewalAlertProps> = ({
  open,
  onRenew,
  onCancel,
  error,
  attempts,
}) => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onRenew(password);
    setSubmitting(false);
    setPassword("");
  };

  return (
    <SystemAlert
      open={open}
      setOpen={() => {}}
      title="Renovación de sesión requerida"
      customDescription={
        <>
          <div className="mb-2">
            Por seguridad, debes reingresar tu contraseña para mantener tu
            sesión activa.
            <br />
            Intentos restantes: {3 - attempts}
          </div>
          <RootInput
            label="Contraseña"
            htmlFor="renew-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || ""}
            disabled={submitting}
            autoFocus
          />
        </>
      }
      confirmText={submitting ? "Renovando..." : "Renovar sesión"}
      cancelText="Cerrar sesión"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      variant={error ? "destructive" : "default"}
    />
  );
};
