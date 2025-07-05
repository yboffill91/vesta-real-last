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
