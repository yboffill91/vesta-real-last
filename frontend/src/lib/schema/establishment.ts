import { z } from "zod";

export const establishmentSchema = z.object({
  name: z.string().min(3, "El nombre del establecimiento debe tener al menos 3 caracteres"),
  legal_name: z.string().min(3, "La razón social debe tener al menos 3 caracteres"),
  tax_id: z.string().min(5, "El RNC/Identificación fiscal debe tener al menos 5 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido").optional().or(z.literal("")),
  website: z.string().url("Ingrese una URL válida").optional().or(z.literal("")),
  logo: z.string().optional()
});

export type EstablishmentFormValues = z.infer<typeof establishmentSchema>;
