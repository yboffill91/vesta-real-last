import { Loader2 } from "lucide-react";

export function Loader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <span className="text-lg text-primary-foreground font-semibold drop-shadow-md text-center">
        {message}
      </span>
    </div>
  );
}
