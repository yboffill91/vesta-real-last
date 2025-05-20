# Documentación de Patrones de Diseño y Arquitectura

## Estructura General del Proyecto

### Backend (`/backend`)
- **app/api/**: Endpoints de FastAPI para recursos como autenticación, categorías, configuración, salud de la BD, establecimientos, menús, órdenes, productos, áreas de venta, puntos de servicio y usuarios.
- **app/models/**: Modelos ORM (SQLAlchemy) que representan las entidades del dominio.
- **app/schemas/**: Esquemas Pydantic para validación y serialización de datos.
- **app/services/**: Lógica de dominio y servicios reutilizables (ej: `user_service.py`).
- **app/utils/**: Utilidades generales, middlewares y seguridad.
- **app/db/**: Configuración y utilidades de base de datos.
- **main.py**: Punto de entrada de la aplicación FastAPI.

### Frontend (`/frontend`)
- **src/app/**: Páginas principales de la aplicación (Next.js).
- **src/components/**: Componentes reutilizables de UI (formularios, dashboards, etc.).
- **src/hooks/**: Custom hooks para lógica reutilizable (ej: `use-establishment`).
- **src/lib/**: Helpers, utilidades y lógica auxiliar (ej: `api.ts`, `auth.ts`).
- **src/models/**: Tipados TypeScript y modelos de datos.
- **src/providers/**: Proveedores de contexto global (ej: `ThemeProvider`).

---

## Patrones de Diseño y Arquitectura Utilizados

### Backend

#### 1. Arquitectura Hexagonal (Ports & Adapters)
- **Descripción**: El backend separa claramente la lógica de dominio (servicios, modelos) de los adaptadores externos (API REST, base de datos).
- **Evidencia**:
  - `app/services/` contiene la lógica de negocio, desacoplada de los detalles de infraestructura.
  - `app/api/` actúa como adaptador de entrada (puerto), exponiendo la lógica a través de endpoints HTTP.
  - `app/models/` y `app/db/` funcionan como adaptadores de salida para persistencia.
- **Ventajas**: Facilita el testeo, la escalabilidad y la extensión futura (por ejemplo, añadir otros canales de entrada/salida).

#### 2. Separación de Capas (MVC/MVP)
- **Controladores**: Los endpoints en `app/api/` funcionan como controladores, coordinando la petición y la respuesta.
- **Modelos**: Definidos en `app/models/`.
- **Vistas**: No aplica directamente en backend REST, pero los esquemas Pydantic (`app/schemas/`) actúan como "vistas" serializando la salida.

#### 3. Inyección de Dependencias y Middlewares
- Uso de `Depends` de FastAPI para inyectar dependencias (autenticación, permisos, servicios).
- Middlewares personalizados para seguridad y autenticación en `app/utils/`.

### Frontend

#### 1. Component Driven Development (CDD)
- **Descripción**: El frontend está construido en torno a componentes reutilizables y desacoplados en `src/components/`.

#### 2. MVVM (Model-View-ViewModel)
- **Modelo**: Definido en `src/models/` (tipos y entidades TS).
- **Vista**: Componentes de UI en `src/components/`.
- **ViewModel**: Hooks personalizados en `src/hooks/` gestionan la lógica y el estado, conectando modelos y vistas.
- **Evidencia**: Ejemplo, el formulario de usuario sigue el patrón: lógica en hook, presentación en componente, tipos en models.

#### 3. Form Provider Pattern
- **Descripción**: Formularios usan `useForm` y el patrón `FormProvider` para compartir métodos y estado entre campos, siguiendo la estructura de `UserCreateForm`.

#### 4. Separation of Concerns
- **Helpers** en `src/lib/` para lógica auxiliar y llamadas API.
- **Providers** para contexto global (tema, usuario, etc.).

---

## Resumen Visual de la Estructura

```text
/backend/app/
  ├── api/
  ├── db/
  ├── models/
  ├── schemas/
  ├── services/
  ├── utils/
  └── main.py
/frontend/src/
  ├── app/
  ├── components/
  ├── hooks/
  ├── lib/
  ├── models/
  └── providers/
```

---

## Observaciones
- El diseño facilita la extensibilidad, el testeo y la incorporación de nuevas funcionalidades (ej: subida de imágenes reutilizable).
- El uso de patrones modernos (Hexagonal, MVVM, Form Provider) asegura mantenibilidad y escalabilidad.

---

_Última actualización: 2025-05-20_
