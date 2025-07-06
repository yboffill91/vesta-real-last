# Documentación del Flujo de Creación de Órdenes en Vesta

## Resumen
El proceso de creación de órdenes en el frontend de Vesta está diseñado para ser robusto, reutilizable y alineado con la API backend. Todo el flujo es gestionado por el dependiente y se realiza en dos pasos principales:

1. **Creación de la orden** (`POST /api/v1/orders/`)
2. **Creación de los items asociados** (`POST /api/v1/orders/{orderId}/items`)

## Detalle del flujo

### 1. Creación de la orden
- Se utiliza el hook `useCreateOrder`.
- El dependiente envía los datos principales de la orden (service_spot_id, sales_area_id, menu_id, created_by, etc.)
- Si la orden se crea correctamente, el backend responde con el objeto de la orden y su `id`.

### 2. Creación de los items de la orden
- Se utiliza el hook `useCreateOrderWithItems`, que internamente llama a `useCreateOrder` y luego agrega los items.
- Por cada producto seleccionado, se hace una petición `POST` a `/api/v1/orders/{orderId}/items` con los datos del producto (product_id, quantity, unit_price, notes, etc.).
- Todos los items se agregan en paralelo para eficiencia.
- Si ocurre un error en la creación de algún item, se reporta y el proceso se detiene.

### 3. Manejo de estados y errores
- Durante el proceso, se gestionan los estados de `loading`, `error` y `success` para feedback en la UI.
- Si todo es exitoso, se muestra mensaje de confirmación y se actualiza el estado de la mesa.

## Hooks involucrados
- `useCreateOrder`: Encargado de la petición principal de creación de la orden.
- `useCreateOrderWithItems`: Orquesta la creación de la orden y sus items, manejando errores globales.

## Ejemplo de uso en componente
El componente `OrderCreate.tsx` usa este flujo para crear una orden con múltiples productos seleccionados por el dependiente.

## Consideraciones
- El flujo está alineado con la documentación y endpoints del backend.
- Los errores se manejan de forma centralizada y se retorna feedback adecuado al usuario.
- El diseño es extensible para agregar validaciones o pasos adicionales en el futuro.

---

> Última actualización: 2025-07-05
