# Convención para Formularios en Vesta

Esta guía define la convención oficial para la creación de formularios en el frontend de Vesta, asegurando consistencia, reutilización y facilidad de mantenimiento.

---

## Convención Establecida

- **Siempre usar** `useForm` de `react-hook-form` para inicializar el formulario y obtener el objeto `methods`.
- **Desestructurar** los métodos necesarios desde `methods` (por ejemplo, `handleSubmit`, `register`, `formState`, etc.).
- **Pasar** `{...methods}` al componente `Form` (o `FormProvider`), permitiendo acceso global a los métodos y estado del formulario en toda la jerarquía de componentes hijos.
- **Estructura base recomendada:** inspirada en el componente `UserCreateForm`.

---

## Ejemplo Práctico

Supongamos que queremos crear un formulario para registrar un nuevo usuario:

```tsx
import { useForm, FormProvider } from 'react-hook-form';
import { Button, Input } from '@/components/ui';

export function UserCreateForm({ onSubmit }) {
  const methods = useForm({
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  });
  const { handleSubmit, register, formState: { errors } } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Usuario" {...register('username', { required: true })} />
        {errors.username && <span>El usuario es requerido</span>}
        <Input label="Email" type="email" {...register('email', { required: true })} />
        {errors.email && <span>El email es requerido</span>}
        <Input label="Contraseña" type="password" {...register('password', { required: true })} />
        {errors.password && <span>La contraseña es requerida</span>}
        <Button type="submit">Crear usuario</Button>
      </form>
    </FormProvider>
  );
}
```

---

## Beneficios de esta convención
- Permite acceso a los métodos de formulario en componentes anidados.
- Facilita la validación y manejo de errores de forma centralizada.
- Mejora la legibilidad y mantenibilidad del código.
- Facilita el testeo y la reutilización de componentes de formulario.

---

**Nota:** Esta estructura debe ser replicada en todos los nuevos formularios del proyecto para mantener la coherencia y las buenas prácticas en el frontend de Vesta.
