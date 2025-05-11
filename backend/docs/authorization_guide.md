# Guía de Autorización Basada en Roles

## Introducción

Este documento explica los conceptos y la implementación de un sistema de autorización basado en roles que puede adaptarse a cualquier framework de backend y frontend. La autorización basada en roles (RBAC - Role-Based Access Control) es un método para controlar el acceso a recursos y operaciones según el rol asignado a cada usuario.

## Índice

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Implementación en Backend](#implementación-en-backend)
3. [Implementación en Frontend](#implementación-en-frontend)
4. [Integración Backend-Frontend](#integración-backend-frontend)
5. [Jerarquía de Roles](#jerarquía-de-roles)
6. [Mejores Prácticas](#mejores-prácticas)

## Conceptos Fundamentales

### Autenticación vs. Autorización

Dos conceptos distintos pero complementarios:

- **Autenticación**: Verifica la identidad del usuario (¿quién eres?)
- **Autorización**: Determina los permisos del usuario (¿qué puedes hacer?)

### Roles y Permisos

- **Rol**: Categoría de usuario que determina su nivel de acceso (ej. Administrador, Usuario)
- **Permiso**: Acción específica que un usuario puede realizar (ej. crear_producto, ver_reportes)

En sistemas simples, los permisos se asocian directamente a roles. En sistemas más complejos, pueden existir permisos individuales que se asignan a roles.

## Implementación en Backend

### 1. Middleware de Autorización

El middleware de autorización intercepta las solicitudes a los endpoints protegidos, verifica el rol del usuario y decide si permitir o denegar el acceso.

```python
# Ejemplo de middleware de autorización en Python (pseudocódigo)
def require_role(allowed_roles):
    def decorator(endpoint_function):
        def wrapper(request, *args, **kwargs):
            # Extraer el token del encabezado de autorización
            token = extract_token_from_request(request)
            
            # Decodificar el token para obtener el rol del usuario
            user_role = get_role_from_token(token)
            
            # Verificar si el rol del usuario está permitido
            if user_role not in allowed_roles:
                return {
                    "error": "Acceso no autorizado",
                    "message": "No tienes permiso para acceder a este recurso"
                }, 403
                
            # Si el rol está permitido, ejecutar la función del endpoint
            return endpoint_function(request, *args, **kwargs)
        return wrapper
    return decorator

# Ejemplo de uso
@app.route("/admin/config")
@require_role(["Soporte", "Administrador"])
def admin_config():
    # Esta función solo se ejecutará si el usuario tiene rol Soporte o Administrador
    return {"data": "Configuración de administrador"}
```

### 2. Agrupación de Endpoints por Roles

Organizar los endpoints según los roles que pueden acceder a ellos mejora la mantenibilidad y claridad del código.

```python
# Ejemplo de organización de rutas por roles (pseudocódigo)

# Rutas para Soporte (acceso total)
soporte_router = Router("/soporte")
soporte_router.add_route("/config-global", config_global_handler)
soporte_router.add_route("/backup", backup_handler)
soporte_router.add_route("/estadisticas", estadisticas_handler)

# Rutas para Administrador
admin_router = Router("/admin")
admin_router.add_route("/productos", productos_handler)
admin_router.add_route("/precios", precios_handler)
admin_router.add_route("/menu", menu_handler)

# Rutas para Dependiente
dependiente_router = Router("/operaciones")
dependiente_router.add_route("/comandas", comandas_handler)
dependiente_router.add_route("/cobros", cobros_handler)

# Aplicar middleware de autorización a grupos completos
app.use("/soporte/*", require_role(["Soporte"]))
app.use("/admin/*", require_role(["Soporte", "Administrador"]))
app.use("/operaciones/*", require_role(["Soporte", "Administrador", "Dependiente"]))
```

### 3. Verificación a Nivel de Servicio

Además de proteger los endpoints, es importante verificar los permisos en la capa de servicio para operaciones críticas.

```javascript
// Ejemplo en JavaScript (pseudocódigo)
class ProductoService {
  async crearProducto(userData, productoData) {
    // Verificar permisos a nivel de servicio
    if (!["Soporte", "Administrador"].includes(userData.role)) {
      throw new Error("No tienes permiso para crear productos");
    }
    
    // Proceder con la creación del producto
    return this.productoRepository.create(productoData);
  }
  
  async obtenerProducto(id) {
    // Esta operación no requiere verificación adicional
    // ya que está permitida para todos los roles
    return this.productoRepository.findById(id);
  }
}
```

## Implementación en Frontend

### 1. Estructura de Carpetas por Rol

Organizar la estructura de archivos según los roles proporciona una clara separación de responsabilidades y facilita la protección de rutas.

```
/app
  /dashboard               # Layout compartido para todos los dashboards
    /soporte               # Solo accesible por Soporte
      /configuracion-global
      /backup
      /page.tsx
    /admin                 # Accesible por Administrador
      /productos
      /precios
      /menu
      /page.tsx
    /dependiente           # Accesible por Dependiente
      /comandas
      /cobros
      /page.tsx
    /layout.tsx            # Layout compartido (navegación, etc.)
```

### 2. Middleware de Protección en Next.js

En Next.js, el middleware permite interceptar y controlar el acceso a rutas antes de que se renderice la página.

```javascript
// middleware.ts en Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extraer token y verificarlo
  const token = request.cookies.get('auth_token')?.value;
  
  // Si no hay token, redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Decodificar token para obtener rol (sin verificar firma)
  const userRole = getUserRoleFromToken(token);
  
  // Obtener la ruta solicitada
  const { pathname } = request.nextUrl;
  
  // Protección por roles
  if (pathname.startsWith('/dashboard/soporte') && userRole !== 'Soporte') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  if (pathname.startsWith('/dashboard/admin') && 
      !['Soporte', 'Administrador'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  if (pathname.startsWith('/dashboard/dependiente') && 
      !['Soporte', 'Administrador', 'Dependiente'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Si pasa todas las verificaciones, permitir el acceso
  return NextResponse.next();
}

export const config = {
  // Definir en qué rutas se aplicará este middleware
  matcher: ['/dashboard/:path*'],
}
```

### 3. Componentes de Alto Orden (HOC) para Protección

Los HOC son una técnica de React para reutilizar lógica de componentes, ideal para implementar la protección basada en roles.

```javascript
// withRoleProtection.js
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth'; // Hook personalizado de autenticación

export function withRoleProtection(Component, allowedRoles) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    
    // Mostrar loader mientras se verifica la autenticación
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    // Redireccionar o mostrar error si no hay usuario autenticado
    if (!user) {
      router.push('/login');
      return null;
    }
    
    // Verificar si el rol del usuario está permitido
    if (!allowedRoles.includes(user.role)) {
      return (
        <AccessDenied 
          message="No tienes permiso para acceder a esta página" 
        />
      );
    }
    
    // Renderizar el componente si tiene permisos
    return <Component {...props} />;
  }
}

// Uso
const AdminDashboard = withRoleProtection(
  DashboardComponent, 
  ['Soporte', 'Administrador']
);
```

### 4. Renderizado Condicional de UI

Mostrar u ocultar elementos de la interfaz según el rol del usuario mejora la experiencia de usuario.

```jsx
function NavigationMenu() {
  const { user } = useAuth();
  
  return (
    <nav>
      {/* Elementos accesibles para todos los usuarios */}
      <MenuItem href="/dashboard">Dashboard</MenuItem>
      
      {/* Elementos solo para Administrador y Soporte */}
      {(['Administrador', 'Soporte'].includes(user?.role)) && (
        <>
          <MenuItem href="/dashboard/admin/productos">Productos</MenuItem>
          <MenuItem href="/dashboard/admin/precios">Precios</MenuItem>
          <MenuItem href="/dashboard/admin/menu">Menú</MenuItem>
        </>
      )}
      
      {/* Elementos exclusivos para Soporte */}
      {user?.role === 'Soporte' && (
        <>
          <MenuItem href="/dashboard/soporte/config-global">Configuración Global</MenuItem>
          <MenuItem href="/dashboard/soporte/backup">Backup</MenuItem>
        </>
      )}
    </nav>
  );
}
```

## Integración Backend-Frontend

La protección debe implementarse en ambas capas por diferentes razones:

### Backend (Seguridad real)

- **Obligatoria**: Es la única forma segura de proteger los datos y operaciones
- **Impenetrable**: No puede ser eludida por usuarios malintencionados
- **Consistente**: Aplica reglas de negocio independientemente del cliente

### Frontend (Experiencia de usuario)

- **UX mejorada**: Oculta opciones no disponibles para evitar frustración
- **Eficiencia**: Previene solicitudes innecesarias a endpoints no autorizados
- **Claridad**: Muestra interfaces adaptadas al rol del usuario

### Flujo de Integración

1. Usuario inicia sesión y recibe JWT con su rol
2. Frontend almacena el token y extrae información de rol
3. Frontend muestra interfaz adaptada al rol del usuario
4. Al intentar acceder a rutas protegidas:
   - Frontend verifica el rol y redirige si es necesario
   - Backend verifica el token y rechaza solicitudes no autorizadas

## Jerarquía de Roles

La jerarquía de roles simplifica la lógica de autorización al establecer una relación de "herencia" entre roles.

### Ejemplo de Jerarquía para un Sistema de Restaurante

```
Soporte (acceso completo)
  ↓
Administrador (gestión de productos, precios, menús)
  ↓
Dependiente (comandas, cobros)
```

### Implementación de Verificación Jerárquica

```javascript
// Definir jerarquía de roles (de mayor a menor privilegio)
const ROLE_HIERARCHY = ['Soporte', 'Administrador', 'Dependiente'];

// Función para verificar si un rol tiene suficientes privilegios
function hasRequiredPrivilege(userRole, requiredRole) {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // Un índice menor significa mayor jerarquía
  return userRoleIndex <= requiredRoleIndex && userRoleIndex !== -1;
}

// Uso
if (hasRequiredPrivilege(user.role, 'Administrador')) {
  // Usuario tiene privilegios de Administrador o superiores
}
```

## Mejores Prácticas

### 1. Principio de Menor Privilegio

Asignar a cada usuario el nivel mínimo de privilegios necesario para realizar sus tareas, reduciendo el riesgo en caso de compromiso de cuenta.

### 2. Separación de Responsabilidades

Dividir operaciones críticas entre diferentes roles para que ningún usuario individual pueda controlar todo el proceso.

### 3. Granularidad Adecuada

Definir roles con la granularidad correcta:
- **Muy granular**: Difícil de mantener, complejo de entender
- **Poco granular**: No permite control preciso de acceso

### 4. Auditoría de Acciones

Registrar todas las acciones críticas junto con el usuario y rol que las realizó para permitir la trazabilidad.

### 5. Actualización Periódica

Revisar y actualizar los roles y permisos periódicamente para asegurar que siguen alineados con las necesidades del negocio.

### 6. Verificación en Múltiples Capas

Implementar verificaciones de autorización en:
- Capa de presentación (UI)
- Capa de API (endpoints)
- Capa de servicio (lógica de negocio)
- Capa de datos (si es aplicable)

## Conclusión

Un sistema de autorización basado en roles bien diseñado proporciona seguridad, claridad y flexibilidad a tu aplicación. Al separar claramente qué puede hacer cada tipo de usuario, reduces riesgos de seguridad y mejoras la experiencia del usuario al mostrarle solo las opciones que son relevantes para sus responsabilidades.

La implementación debe ser coherente en backend y frontend, pero recordando siempre que la seguridad real reside en el backend, mientras que el frontend proporciona principalmente una mejora en la experiencia de usuario.
