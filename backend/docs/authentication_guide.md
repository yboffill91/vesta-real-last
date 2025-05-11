# Guía Completa de Implementación de Autenticación JWT

## Introducción

Este documento explica paso a paso cómo implementar un sistema de autenticación basado en JWT (JSON Web Tokens) que puede adaptarse a cualquier framework de backend (FastAPI, Express, NestJS, etc.) y cómo consumirlo desde cualquier frontend.

## Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Componentes Clave](#componentes-clave)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Implementación Backend](#implementación-backend)
5. [Consumo desde Frontend](#consumo-desde-frontend)
6. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

## Arquitectura del Sistema

La arquitectura de autenticación se basa en un patrón de capas:

```
┌────────────────────┐
│  API (Endpoints)   │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│ Servicios (Lógica) │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│ Utilidades (JWT)   │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│    Base de Datos   │
└────────────────────┘
```

### Beneficios de esta arquitectura:

- **Separación de responsabilidades**: Cada capa tiene un propósito específico
- **Testabilidad**: Facilita las pruebas unitarias e integración
- **Mantenibilidad**: El código está organizado lógicamente
- **Escalabilidad**: Cada componente puede escalar independientemente

## Componentes Clave

### 1. Tabla de Usuarios

La estructura de tabla mínima requerida:

```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(32) NOT NULL,
    surname VARCHAR(32) NOT NULL,
    username VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Almacena hash, no texto plano
    role ENUM('Soporte', 'Administrador', 'Dependiente') NOT NULL
);
```

### 2. Modelos/Esquemas

Define la estructura de datos para:

- **LoginRequest**: Datos de entrada para login (username, password)
- **UserResponse**: Datos de usuario devueltos (sin password)
- **LoginResponse**: Respuesta completa (token + info usuario)
- **TokenData**: Estructura del payload del JWT

### 3. Utilidades de Seguridad

- Funciones de hash y verificación de contraseñas
- Creación y validación de tokens JWT
- Middleware para extraer y validar tokens

### 4. Servicios de Usuario

- Autenticación de usuarios contra base de datos
- Recuperación de información de usuario por ID/username

### 5. API Endpoints

- `/login`: Autenticación y emisión de tokens
- `/token`: Endpoint OAuth2 compatible (opcional)

## Flujo de Autenticación

1. El cliente envía credenciales (username/password)
2. El servidor verifica las credenciales
3. Si son válidas, el servidor genera un JWT
4. El servidor envía el JWT al cliente
5. El cliente almacena el JWT
6. Para rutas protegidas, el cliente incluye el JWT en sus solicitudes
7. El servidor valida el JWT y autoriza/rechaza la solicitud

## Implementación Backend

A continuación se describe la implementación de cada componente de forma agnóstica al framework:

### 1. Conexión a Base de Datos

```javascript
// Ejemplo agnóstico (pseudocódigo)
function getDatabaseConnection() {
  // Conectar a la base de datos según la configuración
  // Devolver conexión o null si falla
}

function checkConnection() {
  const conn = getDatabaseConnection();
  if (conn) {
    // Cerrar conexión y devolver true
    return true;
  }
  return false;
}
```

### 2. Utilidades de Seguridad JWT

```javascript
// Pseudocódigo agnóstico al lenguaje/framework
const SECRET_KEY = "tu_clave_secreta_muy_larga_y_aleatoria";
const ALGORITHM = "HS256";
const TOKEN_EXPIRE_MINUTES = 30;

function hashPassword(plainPassword) {
  // Usar bcrypt o algoritmo similar
  return bcrypt.hash(plainPassword, 10);
}

function verifyPassword(plainPassword, hashedPassword) {
  // Verificar con bcrypt o algoritmo similar
  return bcrypt.verify(plainPassword, hashedPassword);
}

function createToken(payload, expiresIn = TOKEN_EXPIRE_MINUTES * 60) {
  // Añadir tiempo de expiración
  const expiration = Math.floor(Date.now() / 1000) + expiresIn;
  payload.exp = expiration;
  
  // Firmar y devolver token
  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
  } catch (error) {
    return null; // Token inválido o expirado
  }
}
```

### 3. Servicio de Autenticación

```javascript
// Pseudocódigo agnóstico al lenguaje/framework
async function authenticateUser(username, password) {
  const conn = getDatabaseConnection();
  if (!conn) return null;
  
  try {
    // Buscar usuario por username
    const query = "SELECT id, username, name, surname, password, role FROM Users WHERE username = ?";
    const user = await conn.query(query, [username]);
    
    if (!user || !verifyPassword(password, user.password)) {
      return null; // Autenticación fallida
    }
    
    // Devolver información del usuario (sin password)
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      role: user.role
    };
  } catch (error) {
    console.error("Error en autenticación:", error);
    return null;
  } finally {
    conn.close();
  }
}
```

### 4. Endpoint de Login

```javascript
// Pseudocódigo agnóstico al lenguaje/framework
async function loginHandler(request) {
  const { username, password } = request.body;
  
  // Autenticar usuario
  const user = await authenticateUser(username, password);
  if (!user) {
    return {
      status: 401,
      body: { detail: "Credenciales incorrectas" }
    };
  }
  
  // Crear token JWT
  const tokenData = {
    sub: String(user.id),
    username: user.username,
    role: user.role
  };
  
  const accessToken = createToken(tokenData);
  
  // Devolver respuesta con token y datos de usuario
  return {
    status: 200,
    body: {
      access_token: accessToken,
      token_type: "bearer",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        role: user.role
      }
    }
  };
}
```

### 5. Middleware de Protección

```javascript
// Pseudocódigo agnóstico al lenguaje/framework
function authMiddleware(request) {
  // Extraer token del encabezado Authorization
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      body: { detail: "Token de autenticación no proporcionado" }
    };
  }
  
  const token = authHeader.substring(7); // Quitar "Bearer "
  const payload = verifyToken(token);
  
  if (!payload) {
    return {
      status: 401,
      body: { detail: "Token inválido o expirado" }
    };
  }
  
  // Añadir información del usuario a la request
  request.user = {
    id: parseInt(payload.sub),
    username: payload.username,
    role: payload.role
  };
  
  // Continuar con el siguiente middleware/handler
  return null;
}
```

## Consumo desde Frontend

Aquí se describe cómo integrar esta autenticación en cualquier frontend:

### 1. Función de Login

```javascript
// Ejemplo con fetch API (compatible con cualquier framework frontend)
async function login(username, password) {
  try {
    const response = await fetch('http://tu-api.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }
    
    const data = await response.json();
    
    // Guardar token en localStorage (o mejor, en httpOnly cookie en producción)
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error de login:', error);
    throw error;
  }
}
```

### 2. Cliente HTTP Autenticado

```javascript
// Cliente HTTP que incluye token en las peticiones
function createAuthenticatedClient() {
  // Función para obtener headers con token de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };
  
  // Método genérico para peticiones autenticadas
  async function fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders()
      }
    });
    
    // Si recibimos 401, el token podría estar expirado
    if (response.status === 401) {
      // Puedes implementar lógica para logout automático
      // o refresh token si tienes esa funcionalidad
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login'; // Redireccionar a login
      throw new Error('Sesión expirada');
    }
    
    return response;
  }
  
  // Métodos específicos
  return {
    get: (url) => fetchWithAuth(url),
    post: (url, data) => fetchWithAuth(url, { 
      method: 'POST', 
      body: JSON.stringify(data)
    }),
    put: (url, data) => fetchWithAuth(url, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }),
    delete: (url) => fetchWithAuth(url, { method: 'DELETE' })
  };
}

// Uso
const api = createAuthenticatedClient();
// Ahora puedes hacer peticiones autenticadas
api.get('http://tu-api.com/api/v1/protected-resource')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. Protección de Rutas en Frontend

```javascript
// Pseudocódigo para proteger rutas en frontend (adaptable a cualquier framework)
function isAuthenticated() {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  // Opcionalmente, verificar si el token está expirado
  // Decodificar el token (sin verificar firma)
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Comprobar si ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (e) {
    return false;
  }
}

// Guardia de ruta (concepto general, implementación depende del framework)
function ProtectedRoute({ component, ...rest }) {
  if (isAuthenticated()) {
    return component;
  } else {
    // Redireccionar a login
    redirectToLogin();
    return null;
  }
}
```

### 4. Función de Logout

```javascript
function logout() {
  // Eliminar token y datos de usuario
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Redireccionar a login
  window.location.href = '/login';
}
```

## Consideraciones de Seguridad

### 1. Almacenamiento de Tokens

- **localStorage**: Conveniente pero vulnerable a XSS
- **httpOnly Cookie**: Más seguro, pero requiere configuración CORS adecuada
- **Memoria**: Seguro pero se pierde al actualizar la página

### 2. Configuración JWT

- Usar claves secretas fuertes (preferiblemente generadas aleatoriamente)
- Establecer tiempo de expiración razonable
- Considerar implementar tokens de refresco para sesiones largas

### 3. Protección de Contraseñas

- Nunca almacenar contraseñas en texto plano
- Usar algoritmos modernos (bcrypt, Argon2) con factor de trabajo adecuado
- Implementar políticas de contraseñas seguras

### 4. Protección contra Ataques Comunes

- **XSS (Cross-Site Scripting)**: Sanitizar entrada/salida, Content-Security-Policy
- **CSRF (Cross-Site Request Forgery)**: Tokens CSRF, SameSite cookies
- **Inyección SQL**: Usar consultas parametrizadas
- **Fuerza Bruta**: Límites de intentos, captchas, retrasos exponenciales

## Próximos Pasos

1. **Refresh Tokens**: Para mantener sesiones largas de forma segura
2. **Autorización basada en Roles**: Controlar acceso a recursos según el rol
3. **Gestión de Usuarios**: CRUD completo para administración
4. **Recuperación de Contraseña**: Flujo seguro para restablecer contraseñas
5. **Autenticación de Dos Factores (2FA)**: Capa adicional de seguridad

## Conclusión

Esta guía presenta un enfoque sólido y adaptable para implementar autenticación JWT en cualquier stack tecnológico. Los principios son los mismos independientemente del lenguaje o framework, aunque la sintaxis específica pueda variar.

Recuerda que la seguridad es un proceso continuo que requiere atención constante y actualizaciones periódicas para mantenerse al día con las mejores prácticas y amenazas emergentes.
