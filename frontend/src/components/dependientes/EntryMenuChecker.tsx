"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMenusWithItems } from "@/hooks/useMenusWithItems";
import { Button } from "@/components/ui/Buttons";
import { RefreshCcw } from "lucide-react";

interface EntryMenuCheckerProps {
  onSuccess?: (menu: any) => void;
}

export function EntryMenuChecker({ onSuccess }: EntryMenuCheckerProps) {
  const { menus, loading, error, refetch } = useMenusWithItems();

  if (loading) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-24">
        <CardHeader>
          <CardTitle>Cargando menús publicados...</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="animate-pulse">Por favor, espere...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-24">
        <AlertTitle>Error al consultar menús</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!menus.length) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-24">
        <CardHeader>
          <CardTitle>No hay menús publicados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-pretty text-muted-foreground">
            Actualmente no hay ningún menú publicado para tomar pedidos.
            <br />
            Contacta con un administrador si crees que esto es un error.
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={refetch}>
              <RefreshCcw /> Refrescar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay menús publicados, continuar al siguiente paso (selección de área/puesto)
  // Notifica al padre solo una vez
  if (onSuccess) {
    setTimeout(() => onSuccess(menus[0]), 100);
  }
  return (
    <Card className="w-full max-w-lg mx-auto mt-24">
      <CardHeader>
        <CardTitle>¡Menú publicado encontrado!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-pretty">
          Redirigiendo a la selección de área y puesto...
        </p>
      </CardContent>
    </Card>
  );
}
