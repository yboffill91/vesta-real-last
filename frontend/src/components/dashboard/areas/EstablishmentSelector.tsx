import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useEstablishments } from "@/hooks/use-establishment";

interface Props {
  disabled?: boolean;
}

export function EstablishmentSelector({ disabled }: Props) {
  const { establishments, loading, error } = useEstablishments();
  const { register, setValue, watch, formState } = useFormContext();
  const selectedId = watch("establishment_id");
  console.log(typeof selectedId);

  if (loading)
    return (
      <div className="text-muted-foreground text-sm">
        Cargando establecimientos...
      </div>
    );
  if (error) return <div className="text-destructive text-sm">{error}</div>;
  if (establishments.length === 0)
    return (
      <div className="text-destructive text-sm">
        No hay establecimientos disponibles.
      </div>
    );

  // Siempre mostrar radios, aunque haya solo uno
  // Mensaje de error seguro y tipado
  const errorMsg = formState.errors.establishment_id?.message;
  const showError = typeof errorMsg === "string" && errorMsg;
  return (
    <div className="flex flex-col gap-2 mt-2">
      {establishments.map((est) => (
        <label
          key={est.id}
          className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
            selectedId === est.id
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-accent/50"
          }`}
          htmlFor={`establishment-${est.id}`}
        >
          <input
            type="radio"
            id={`establishment-${est.id}`}
            value={est.id}
            {...register("establishment_id", { valueAsNumber: true })}
            checked={selectedId === est.id}
            onChange={(e) =>
              setValue("establishment_id", Number(e.target.value))
            }
            className="accent-primary"
            disabled={disabled}
          />
          <span className="">{est.name}</span>
        </label>
      ))}
      {showError && <div className="text-destructive text-sm">{errorMsg}</div>}
    </div>
  );
}
