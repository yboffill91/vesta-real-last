# ToDo - Vesta Real System

## Rama: menus/refactoring

### Tareas pendientes

- Continuar con la implementación de las funciones de duplicación de menús
- Solucionar problemas de autenticación en el endpoint `/api/v1/menus/{menu_id}/duplicate`
- Implementar la UI de duplicación con solicitud de nombre en MenuTable.tsx
- Verificar que la autenticación y los roles de usuario sean correctos para acceder a las funcionalidades de administración
- Completar la integración front-end/back-end de las funcionalidades de menú

### Notas importantes

- El endpoint de duplicación requiere un usuario con rol "Soporte" o "Administrador"
- Es posible que sea necesario cerrar sesión y volver a iniciarla para refrescar el token de autenticación
- Si persisten los problemas CORS, revisar la implementación de autenticación y verificar los roles de usuario

---

## Backlog

- Refactorizar backend de órdenes para permitir productos de múltiples menús activos en una sola orden. Esto implica:
  - Eliminar `menu_id` de la tabla Orders y agregarlo a OrderItems.
  - Adaptar el endpoint y los esquemas para soportar la relación uno a muchos entre orden y menús/productos.
  - Actualizar la documentación y los tests para reflejar el nuevo flujo.

- [INVESTIGAR] Adaptar la funcionalidad de refresco de service spots para que utilice WebSocket:
  - Investigar la integración de WebSocket en el frontend y backend.
  - Hacer que el servidor notifique al frontend cuando haya cambios en los service spots (creación, actualización, cierre de orden, etc.).
  - Reemplazar el refetch por intervalo con una suscripción reactiva basada en eventos del servidor.
  - Documentar pros y contras de la solución y pruebas necesarias.
