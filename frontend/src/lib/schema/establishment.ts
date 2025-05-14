import { z } from "zod";

export const establishmentSchema = z.object({
  name: z.string().min(3, "El nombre del establecimiento es obligatorio"),
  address: z.string().min(5, "La dirección es obligatoria"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos").regex(/^[\d+\-() ]+$/, "Teléfono no válido"),
  logo: z.string().min(1, "El logo es obligatorio"),
  tax_rate: z.number().min(0, "El impuesto debe ser 0 o mayor").default(0),
  currency: z.literal("CUP"),
  is_configured: z.literal(false)
});

export type EstablishmentFormValues = z.infer<typeof establishmentSchema>;
