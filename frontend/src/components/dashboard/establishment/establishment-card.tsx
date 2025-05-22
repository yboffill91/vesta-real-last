import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, DashboardCardAlert } from "@/components/ui";
import { useEstablishment } from "@/hooks/use-establishment";
import { Loader2, AlertTriangle, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function EstablishmentCard() {
  const { establishment, loading, error } = useEstablishment();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" /> Cargando datos del
        establecimiento...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!establishment) {
    return (
      <DashboardCardAlert
        alert="No ha configurado un establecimiento todavía."
        action="Configurar establecimiento"
        link="/dashboard/establishment/add"
        title="No ha configurado un establecimiento todavía."
        variant="warning"
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">{establishment.name}</div>
      {establishment.address && (
        <div className="text-sm text-muted-foreground">
          Dirección: {establishment.address}
        </div>
      )}
      {establishment.phone && (
        <div className="text-sm text-muted-foreground">
          Teléfono: {establishment.phone}
        </div>
      )}

      {establishment.currency && (
        <div className="text-sm text-muted-foreground">
          Moneda: {establishment.currency}
        </div>
      )}

      {/* Agrega aquí más campos según el modelo real del establecimiento */}
    </div>
  );
}
