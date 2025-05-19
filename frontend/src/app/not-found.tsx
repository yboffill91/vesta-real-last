import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary text-center text-3xl">
            Página no encontrada (404)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            La página que buscas no existe o ha sido movida.
            <br />
            Puedes regresar al inicio.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
