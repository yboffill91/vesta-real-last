"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-destructive">
            ¡Ha ocurrido un error!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            Lo sentimos, algo salió mal en la aplicación.
            <br />
            Por favor, intenta nuevamente o regresa al inicio.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
