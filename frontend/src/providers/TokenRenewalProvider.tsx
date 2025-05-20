"use client";
import { createContext, useContext } from "react";
import { useTokenAutoRenewal } from "@/hooks/useTokenAutoRenewal";
import { TokenRenewalAlert } from "@/components/ui/TokenRenewalAlert";

interface TokenRenewalContextProps {
  showPasswordModal: boolean;
  renewalError: string | null;
  handleRenew: (password: string) => void;
  handleCancel: () => void;
  setShowPasswordModal: (open: boolean) => void;
  renewalAttempts: number;
}

const TokenRenewalContext = createContext<TokenRenewalContextProps | undefined>(
  undefined
);

export const TokenRenewalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ctx = useTokenAutoRenewal();

  return (
    <TokenRenewalContext.Provider value={ctx}>
      {children}
      <TokenRenewalAlert
        open={ctx.showPasswordModal}
        onRenew={ctx.handleRenew}
        onCancel={ctx.handleCancel}
        error={ctx.renewalError}
        attempts={ctx.renewalAttempts}
      />
    </TokenRenewalContext.Provider>
  );
};

export function useTokenRenewal() {
  const context = useContext(TokenRenewalContext);
  if (!context) {
    throw new Error(
      "useTokenRenewal debe usarse dentro de TokenRenewalProvider"
    );
  }
  return context;
}
