"use client";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen w-screen flex items-center justify-center flex-col">
      <div className="flex flex-col items-center p-8 border rounded-lg">
        <h1 className="text-7xl font-semibold bg-gradient-to-br from-primary to-destructive bg-clip-text text-transparent">
          Error 404
        </h1>
        <h2 className="text-3xl font-semibold px-2 py-px bg-primary text-primary-foreground rounded-lg">
          Página no encontrada
        </h2>
        <p className="text-lg my-8 ">
          La página que buscas no existe o ha sido movida.
        </p>
        <Separator className="mb-6" />
        <Button onClick={router.back}>Volver a atrás</Button>
      </div>
    </main>
  );
}
