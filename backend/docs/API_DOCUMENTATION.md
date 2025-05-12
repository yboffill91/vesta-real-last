# Documentación de la API de Vesta

## Introducción

Esta documentación proporciona una guía detallada sobre cómo consumir los endpoints de la API de Vesta desde una aplicación frontend. Cada sección contiene información sobre las rutas, métodos HTTP, encabezados requeridos, parámetros y ejemplos de respuestas.

## Contenido

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Categorías de Productos](#categorías-de-productos)
4. [Productos](#productos)
5. [Áreas de Venta](#áreas-de-venta)
6. [Puestos de Servicio](#puestos-de-servicio)
7. [Menús](#menús)
8. [Órdenes](#órdenes)
9. [Configuración del Establecimiento](#configuración-del-establecimiento)

Consulta los archivos individuales en la carpeta /docs para una documentación detallada de cada sección:

- [AUTH_API.md](./AUTH_API.md) - Documentación de autenticación
- [USERS_API.md](./USERS_API.md) - Documentación de usuarios
- [CATEGORIES_API.md](./CATEGORIES_API.md) - Documentación de categorías
- [PRODUCTS_API.md](./PRODUCTS_API.md) - Documentación de productos
- [SALES_AREAS_API.md](./SALES_AREAS_API.md) - Documentación de áreas de venta
- [SERVICE_SPOTS_API.md](./SERVICE_SPOTS_API.md) - Documentación de puestos de servicio
- [MENUS_API.md](./MENUS_API.md) - Documentación de menús
- [ORDERS_API.md](./ORDERS_API.md) - Documentación de órdenes
- [ESTABLISHMENT_API.md](./ESTABLISHMENT_API.md) - Documentación de configuración del establecimiento

## Autenticación

Para acceder a la mayoría de los endpoints protegidos, necesitará incluir un token de autenticación en el encabezado de sus solicitudes.

### Encabezado de Autenticación

```
Authorization: Bearer <token>
```

Donde `<token>` es el token JWT obtenido al iniciar sesión.

### Autenticación y Permisos

La API utiliza un sistema de roles para controlar el acceso:

- **Dependiente**: Acceso básico a operaciones de servicio (órdenes, productos, etc.)
- **Administrador**: Acceso a la mayoría de las operaciones, incluida la gestión de usuarios
- **Soporte**: Acceso completo a todas las operaciones, incluidas las operaciones críticas del sistema

Consulte [AUTH_API.md](./AUTH_API.md) para obtener detalles completos sobre los endpoints de autenticación.

## Formato de Respuesta Estándar

Todas las respuestas de la API siguen un formato estándar:

```json
{
  "status": "success | error",
  "message": "Mensaje descriptivo",
  "data": { ... } | [ ... ],
  "error": { ... }  // Solo presente en caso de error
}
```

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado con éxito
- **400 Bad Request**: Solicitud incorrecta (datos inválidos, etc.)
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No tiene permisos suficientes
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## Paginación

Algunos endpoints que devuelven listas admiten paginación con los siguientes parámetros:

- `page`: Número de página (comienza en 1)
- `limit`: Cantidad de elementos por página

Ejemplo de respuesta paginada:

```json
{
  "status": "success",
  "message": "Recursos recuperados exitosamente",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 50,
    "total_pages": 3
  }
}
```
