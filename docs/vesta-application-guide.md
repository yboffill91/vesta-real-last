# Vesta Application Documentation

## Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Convenciones de Diseño UI/UX](#convenciones-de-diseño-uiux)
3. [Patrones de Comunicación con API](#patrones-de-comunicación-con-api)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Estados y Flujos de Datos](#estados-y-flujos-de-datos)
6. [Modelo de Datos](#modelo-de-datos)
7. [Convenciones de Desarrollo](#convenciones-de-desarrollo)

## Estructura del Proyecto

### Backend (/backend)
- **app/**
  - **api/**: Endpoints FastAPI
    - auth
    - categories
    - config
    - db_health
    - establishment
    - menus
    - orders
    - products
    - sales_areas
    - service_spots
    - users
  - **db/**: Gestión de base de datos
  - **models/**: Modelos ORM
    - base
    - establishment
    - menu
    - order
    - etc.
  - **schemas/**: Esquemas Pydantic
    - auth
    - establishment
    - menu
    - order
    - etc.
  - **services/**: Servicios de dominio (user_service)
  - **utils/**: Utilidades (auth_middleware, security)
  - **main.py**
- Dockerfile, Dockerfile.prod, requirements.txt, scripts de migraciones y utilidades

### Frontend (/frontend)
- **src/**
  - **app/**: Páginas Next.js
  - **components/**: Componentes UI
    - auth
    - dashboard
    - ui
    - ThemeToggle
  - **hooks/**: Custom hooks
    - use-establishment
    - use-user
    - useServiceSpots
    - etc.
  - **lib/**: Helpers y utilidades
    - api
    - auth
    - utils
  - **models/**: Tipados y modelos
    - User
    - establishment
    - requests/responses
  - **providers/**: ThemeProvider, etc.
- next.config.ts, tsconfig.json, package.json, README.md

## Convenciones de Diseño UI/UX

### Estructura de Formularios

Todos los componentes de tipo formulario deben seguir la estructura establecida en `UserCreateForm`, utilizando:

1. **React Hook Form**: 
   ```tsx
   const methods = useForm<TipoDatosFormulario>({
     resolver: zodResolver(esquemaValidacion),
     mode: 'onBlur',
   });
   ```

2. **Desestructuración de métodos**: 
   ```tsx
   const {
     register,
     handleSubmit,
     formState: { errors, isSubmitting },
     reset,
     watch,
     // otros métodos según necesidad
   } = methods;
   ```

3. **Uso de FormProvider**:
   ```tsx
   <FormProvider {...methods}>
     <form onSubmit={handleSubmit(onSubmitHandler)}>
       {/* Contenido del formulario */}
     </form>
   </FormProvider>
   ```

### Patrones de Componentes UI

1. **Cards para secciones de dashboard**:
   ```tsx
   <DashboardCards title="Título" icon={IconComponent}>
     {/* Contenido */}
   </DashboardCards>
   ```

2. **Indicadores de estado**:
   Los estados se muestran con colores distintivos:
   - Verde: estados positivos (ej. "libre")
   - Amarillo: estados en proceso (ej. "pedido_abierto")
   - Azul: estados completados (ej. "cobrado")
   - Gris: estados por defecto o deshabilitados

3. **Tablas de datos**:
   Uso de tablas estructuradas con cabeceras claramente definidas y celdas consistentes.

4. **Feedback visual**:
   - Loaders para operaciones asíncronas (spinner)
   - Mensajes de error y éxito claros
   - Feedback inmediato en validaciones de formulario

5. **Elementos interactivos**:
   - Botones con estados diferenciados (normal, hover, active, disabled)
   - Formularios con validación inmediata
   - Tooltips para información contextual

## Patrones de Comunicación con API

### Cliente API (`fetchApi`)

El sistema utiliza un cliente API centralizado en `/lib/api.ts` que proporciona:

1. **Configuración base**:
   - URL base definida por variables de entorno
   - Manejo de headers comunes
   - Inclusión automática de token de autenticación

2. **Estructura de la función**:
   ```typescript
   export async function fetchApi<T = any>(
     endpoint: string, 
     options: FetchOptions = {}
   ): Promise<{ 
     success: boolean; 
     data?: T; 
     error?: string; 
     status?: number 
   }>
   ```

3. **Opciones de configuración**:
   ```typescript
   export type FetchOptions = {
     method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
     headers?: Record<string, string>;
     body?: any;
     token?: string;
     query?: Record<string, string>;
     noToken?: boolean;
   };
   ```

4. **Patrón de uso en hooks**:
   ```typescript
   const fetchData = useCallback(async () => {
     setLoading(true);
     setError(null);
     try {
       const response = await fetchApi('/api/v1/ruta-endpoint', {
         // opciones
       });
       
       if (response.success && response.data) {
         // procesar datos
       } else {
         setError(response.error || "Mensaje de error por defecto");
       }
     } catch (err) {
       setError(err.message || "Mensaje de error por defecto");
     } finally {
       setLoading(false);
     }
   }, [dependencias]);
   ```

5. **Manejo de errores**:
   - Captura de errores HTTP y de red
   - Extracción de mensajes de error desde la respuesta API
   - Estructura consistente para errores

### Custom Hooks

Cada entidad principal tiene su propio custom hook que encapsula la lógica de comunicación API:

```typescript
export function useServiceSpots() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Entidad[]>([]);

  // Métodos CRUD
  const fetchAll = useCallback(async (filters?) => {...}, []);
  const getById = useCallback(async (id) => {...}, []);
  const create = useCallback(async (data) => {...}, []);
  const update = useCallback(async (id, data) => {...}, []);
  const remove = useCallback(async (id) => {...}, []);

  return { 
    data, loading, error, 
    fetchAll, getById, create, update, remove 
  };
}
```

## Endpoints Disponibles

La aplicación expone los siguientes endpoints a través de su API:

### Auth
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cierre de sesión

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/{id}` - Obtener usuario por ID
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/{id}` - Actualizar usuario
- `DELETE /api/v1/users/{id}` - Eliminar usuario

### Establecimientos
- `GET /api/v1/establishments` - Listar establecimientos
- `GET /api/v1/establishments/{id}` - Obtener establecimiento por ID
- `POST /api/v1/establishments` - Crear establecimiento
- `PUT /api/v1/establishments/{id}` - Actualizar establecimiento
- `DELETE /api/v1/establishments/{id}` - Eliminar establecimiento

### Áreas de Venta
- `GET /api/v1/sales-areas` - Listar áreas de venta
- `GET /api/v1/sales-areas/{id}` - Obtener área de venta por ID
- `POST /api/v1/sales-areas` - Crear área de venta
- `PUT /api/v1/sales-areas/{id}` - Actualizar área de venta
- `DELETE /api/v1/sales-areas/{id}` - Eliminar área de venta

### Puestos de Servicio (Mesas)
- `GET /api/v1/service-spots` - Listar puestos de servicio
- `GET /api/v1/service-spots/{id}` - Obtener puesto de servicio por ID
- `POST /api/v1/service-spots` - Crear puesto de servicio
- `PUT /api/v1/service-spots/{id}` - Actualizar puesto de servicio
- `DELETE /api/v1/service-spots/{id}` - Eliminar puesto de servicio

### Menús
- `GET /api/v1/menus` - Listar menús
- `GET /api/v1/menus/{id}` - Obtener menú por ID
- `POST /api/v1/menus` - Crear menú
- `PUT /api/v1/menus/{id}` - Actualizar menú
- `DELETE /api/v1/menus/{id}` - Eliminar menú

### Categorías
- `GET /api/v1/categories` - Listar categorías
- `GET /api/v1/categories/{id}` - Obtener categoría por ID
- `POST /api/v1/categories` - Crear categoría
- `PUT /api/v1/categories/{id}` - Actualizar categoría
- `DELETE /api/v1/categories/{id}` - Eliminar categoría

### Productos
- `GET /api/v1/products` - Listar productos
- `GET /api/v1/products/{id}` - Obtener producto por ID
- `POST /api/v1/products` - Crear producto
- `PUT /api/v1/products/{id}` - Actualizar producto
- `DELETE /api/v1/products/{id}` - Eliminar producto

### Pedidos
- `GET /api/v1/orders` - Listar pedidos
- `GET /api/v1/orders/{id}` - Obtener pedido por ID
- `POST /api/v1/orders` - Crear pedido
- `PUT /api/v1/orders/{id}` - Actualizar pedido
- `DELETE /api/v1/orders/{id}` - Eliminar pedido

### Configuración
- `GET /api/v1/config` - Obtener configuración
- `PUT /api/v1/config` - Actualizar configuración

### DB Health
- `GET /api/v1/health` - Verificar estado de la base de datos

## Estados y Flujos de Datos

### Estados de Puestos de Servicio (Mesas)

Se manejan exclusivamente tres estados para los puestos de servicio (mesas):

1. **libre**: La mesa está lista para ser ocupada
   - Color: Verde
   - Acciones disponibles: Asignar clientes, iniciar pedido

2. **pedido_abierto**: Hay un pedido abierto en la mesa
   - Color: Amarillo
   - Acciones disponibles: Modificar pedido, cerrar pedido

3. **cobrado**: Los clientes fueron atendidos y el dependiente debe limpiar la mesa
   - Color: Azul
   - Acciones disponibles: Marcar como libre

### Flujo de Imágenes

La lógica de subida de imágenes (logo, menús, etc.) está diseñada para ser reutilizable y extensible:

- En la primera versión se utiliza principalmente para logos de establecimiento
- Está preparada para futuras funcionalidades como imágenes de menús, cartas, etc.
- Componentes relacionados con imágenes incluyen validación de formato y tamaño

## Modelo de Datos

La aplicación utiliza un modelo entidad-relación documentado en detalle en `/backend/ER_MODEL.md`. Este documento incluye:

- Descripción de entidades
- Relaciones entre entidades
- Diagrama ER textual

Este archivo debe usarse como referencia para:
- Tareas de dockerización
- Migraciones
- Generación de datos seed

## Convenciones de Desarrollo

### Formularios

1. **Validación**: Utilizar Zod para esquemas de validación
2. **Estado**: Manejar a través de React Hook Form
3. **Estructura**: 
   - FormProvider para el contexto
   - Inputs controlados
   - Manejo de errores a nivel de campo

### Comunicación API

1. **Consumo**: Utilizar custom hooks específicos por entidad
2. **Errores**: Capturar y mostrar errores de forma consistente
3. **Loading**: Indicadores visuales durante operaciones asíncronas

### Estado de la Aplicación

1. **Estado local**: Para componentes individuales
2. **Estado global**: Para información compartida entre múltiples componentes
3. **Persistencia**: LocalStorage para tokens y preferencias de usuario

### Buenas Prácticas

1. **Componentes**: Mantener pequeños y con responsabilidad única
2. **Hooks**: Encapsular lógica reutilizable
3. **TypeScript**: Tipado estricto en todos los componentes y funciones
4. **Rutas**: Estructura clara y jerárquica
5. **Estilos**: Consistentes y basados en el sistema de diseño
