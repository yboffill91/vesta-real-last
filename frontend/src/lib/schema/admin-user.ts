import { z } from "zod";

export const adminUserSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  username: z.string()
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
    .regex(/^[\wñÑ.\-_]+$/, "El nombre de usuario solo puede contener letras, números, ñ, ., -, _"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
