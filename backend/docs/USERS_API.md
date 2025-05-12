# Documentación de la API de Usuarios

## Descripción General

La API de usuarios permite la gestión completa de usuarios en el sistema, incluyendo creación, actualización, consulta y eliminación de usuarios.

## Base URL

```
http://localhost:8000/api/v1/users
```

## Permisos Requeridos

La mayoría de los endpoints requieren permisos de administrador o soporte. Los usuarios con rol "Dependiente" solo pueden acceder a sus propios datos.

## Endpoints

### Obtener Todos los Usuarios

Recupera la lista de todos los usuarios registrados en el sistema.

- **URL**: `/`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de consulta

| Parámetro   | Tipo    | Requerido | Descripción                         |
|-------------|---------|-----------|-------------------------------------|
| active_only | boolean | No        | Si es true, solo muestra usuarios activos |
| role        | string  | No        | Filtrar por rol (Administrador, Dependiente, Soporte) |
| page        | integer | No        | Número de página para paginación    |
| limit       | integer | No        | Cantidad de elementos por página    |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/users?active_only=true&role=Dependiente', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/users', {
  params: {
    active_only: true,
    role: 'Dependiente'
  },
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "username": "dependiente1",
      "full_name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "Dependiente",
      "is_active": true,
      "created_at": "2025-05-10T15:30:45",
      "updated_at": "2025-05-11T09:20:15"
    },
    {
      "id": 3,
      "username": "dependiente2",
      "full_name": "María López",
      "email": "maria@example.com",
      "role": "Dependiente",
      "is_active": true,
      "created_at": "2025-05-10T16:45:22",
      "updated_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 2,
    "total_pages": 1
  }
}
```

### Crear Usuario

Crea un nuevo usuario en el sistema.

- **URL**: `/`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de solicitud

| Campo     | Tipo   | Requerido | Descripción                          |
|-----------|--------|-----------|--------------------------------------|
| username  | string | Sí        | Nombre de usuario único              |
| password  | string | Sí        | Contraseña (mínimo 6 caracteres)     |
| full_name | string | Sí        | Nombre completo del usuario          |
| email     | string | No        | Correo electrónico                   |
| role      | string | Sí        | Rol (Administrador, Dependiente, Soporte) |
| is_active | boolean| No        | Estado del usuario (default: true)   |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    username: "nuevo_dependiente",
    password: "password123",
    full_name: "Carlos Sánchez",
    email: "carlos@example.com",
    role: "Dependiente",
    is_active: true
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.post('http://localhost:8000/api/v1/users', {
  username: "nuevo_dependiente",
  password: "password123",
  full_name: "Carlos Sánchez",
  email: "carlos@example.com",
  role: "Dependiente",
  is_active: true
}, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (201 Created)

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": 4,
    "username": "nuevo_dependiente",
    "full_name": "Carlos Sánchez",
    "email": "carlos@example.com",
    "role": "Dependiente",
    "is_active": true,
    "created_at": "2025-05-12T10:15:30",
    "updated_at": null
  }
}
```

#### Respuesta de error (400 Bad Request)

```json
{
  "status": "error",
  "message": "Username already exists",
  "error": {
    "code": "duplicate_username",
    "details": "The username 'nuevo_dependiente' is already in use"
  }
}
```

### Obtener Usuario por ID

Recupera la información detallada de un usuario específico.

- **URL**: `/{user_id}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte, o el propio usuario

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción           |
|-----------|---------|------------------------|
| user_id   | integer | ID del usuario a obtener |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/users/4', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/users/4', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "id": 4,
    "username": "nuevo_dependiente",
    "full_name": "Carlos Sánchez",
    "email": "carlos@example.com",
    "role": "Dependiente",
    "is_active": true,
    "created_at": "2025-05-12T10:15:30",
    "updated_at": null
  }
}
```

#### Respuesta de error (404 Not Found)

```json
{
  "status": "error",
  "message": "User not found",
  "error": {
    "code": "resource_not_found",
    "details": "The user with ID 999 does not exist"
  }
}
```

### Actualizar Usuario

Actualiza la información de un usuario existente.

- **URL**: `/{user_id}`
- **Método**: `PUT`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte, o el propio usuario (con restricciones)

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción                 |
|-----------|---------|-----------------------------|
| user_id   | integer | ID del usuario a actualizar |

#### Parámetros de solicitud

| Campo     | Tipo    | Requerido | Descripción                           |
|-----------|---------|-----------|---------------------------------------|
| password  | string  | No        | Nueva contraseña                      |
| full_name | string  | No        | Nombre completo actualizado           |
| email     | string  | No        | Correo electrónico actualizado        |
| role      | string  | No        | Nuevo rol (solo Admin/Soporte)        |
| is_active | boolean | No        | Estado actualizado (solo Admin/Soporte)|

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/users/4', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    full_name: "Carlos Sánchez Rodríguez",
    email: "carlos.sanchez@example.com"
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.put('http://localhost:8000/api/v1/users/4', {
  full_name: "Carlos Sánchez Rodríguez",
  email: "carlos.sanchez@example.com"
}, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "id": 4,
    "username": "nuevo_dependiente",
    "full_name": "Carlos Sánchez Rodríguez",
    "email": "carlos.sanchez@example.com",
    "role": "Dependiente",
    "is_active": true,
    "created_at": "2025-05-12T10:15:30",
    "updated_at": "2025-05-12T11:30:45"
  }
}
```

### Eliminar Usuario

Elimina un usuario del sistema.

- **URL**: `/{user_id}`
- **Método**: `DELETE`
- **Autenticación requerida**: Sí (Bearer Token)
- **Permisos requeridos**: Admin, Soporte

#### Parámetros de ruta

| Parámetro | Tipo    | Descripción               |
|-----------|---------|---------------------------|
| user_id   | integer | ID del usuario a eliminar |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/users/4', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.delete('http://localhost:8000/api/v1/users/4', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "id": 4,
    "username": "nuevo_dependiente",
    "full_name": "Carlos Sánchez Rodríguez",
    "email": "carlos.sanchez@example.com",
    "role": "Dependiente",
    "is_active": false,
    "created_at": "2025-05-12T10:15:30",
    "updated_at": "2025-05-12T14:20:10"
  }
}
```

## Manejo de Errores Comunes

| Código HTTP | Descripción                    | Posible Causa                                  |
|-------------|--------------------------------|------------------------------------------------|
| 400         | Bad Request                    | Datos de entrada inválidos, username duplicado |
| 401         | Unauthorized                   | Token de autenticación faltante o inválido     |
| 403         | Forbidden                      | Permisos insuficientes para la operación       |
| 404         | Not Found                      | Usuario no encontrado                          |
| 500         | Internal Server Error          | Error del servidor al procesar la solicitud    |

## Recomendaciones para Frontend

- Implementar validaciones de formularios que coincidan con las restricciones del backend
- Manejar adecuadamente los mensajes de error
- Mantener actualizados los estados de usuario después de las operaciones CRUD
- Utilizar componentes reutilizables para la gestión de usuarios (formularios, tablas, etc.)
