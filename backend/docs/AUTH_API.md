# Documentación de la API de Autenticación

## Descripción General

La API de autenticación permite a los usuarios iniciar sesión en el sistema y obtener tokens JWT para acceder a endpoints protegidos.

## Base URL

```
http://localhost:8000/api/v1/auth
```

## Endpoints

### Login

Permite a un usuario autenticarse y obtener un token JWT.

- **URL**: `/login`
- **Método**: `POST`
- **Autenticación requerida**: No

#### Parámetros de solicitud

| Campo    | Tipo   | Requerido | Descripción            |
|----------|--------|-----------|------------------------|
| username | string | Sí        | Nombre de usuario      |
| password | string | Sí        | Contraseña del usuario |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'adminpassword'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.post('http://localhost:8000/api/v1/auth/login', {
  username: 'admin',
  password: 'adminpassword'
})
.then(response => console.log(response.data));
```

#### Respuesta exitosa (200 OK)

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Admin User",
      "role": "Administrador",
      "is_active": true
    }
  }
}
```

#### Respuesta de error (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Invalid username or password",
  "error": {
    "code": "authentication_error",
    "details": "The credentials provided are incorrect"
  }
}
```

### Verificar Token

Verifica si un token JWT es válido y devuelve información del usuario.

- **URL**: `/verify`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token)

#### Encabezados

| Encabezado     | Valor            | Descripción                   |
|----------------|------------------|-------------------------------|
| Authorization  | Bearer {token}   | Token JWT obtenido al logear  |

#### Ejemplo de solicitud

```javascript
// Usando fetch
fetch('http://localhost:8000/api/v1/auth/verify', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Usando axios
axios.get('http://localhost:8000/api/v1/auth/verify', {
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
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Admin User",
      "role": "Administrador",
      "is_active": true
    }
  }
}
```

#### Respuesta de error (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "error": {
    "code": "token_error",
    "details": "The provided token is invalid or has expired"
  }
}
```

## Almacenamiento de Token en Frontend

Es recomendable almacenar el token JWT en localStorage o en una cookie HttpOnly. Ejemplo de almacenamiento en localStorage:

```javascript
// Almacenar token después de login exitoso
localStorage.setItem('token', response.data.access_token);

// Recuperar token para solicitudes posteriores
const token = localStorage.getItem('token');

// Borrar token al cerrar sesión
localStorage.removeItem('token');
```

## Función de Ayuda para Solicitudes Autenticadas

Puede crear una función de ayuda para incluir automáticamente el token en todas las solicitudes:

```javascript
// Función auxiliar usando fetch
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

// Función auxiliar usando axios
import axios from 'axios';

const authAxios = axios.create();

authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Este enfoque facilita el manejo de solicitudes autenticadas en toda la aplicación.
