# Pasos para la Implementación del Frontend (Next.js)

## Configuración Inicial

- [x] Crear proyecto Next.js con App Router, TypeScript y Tailwind CSS
- [x] Configurar variables de entorno (NEXT_PUBLIC_API_URL)
- [x] Implementar cliente API para comunicación con el backend
- [x] Configurar store de autenticación con zustand

## Instalación de shadcn/ui

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar shadcn/ui
pnpm dlx shadcn-ui@latest init

# Configuración recomendada:
# - Estilo: Default (o el tema que prefieras)
# - Base color: Slate (o el color que prefieras)
# - Directorio de componentes: @/components
# - Directorio de utilidades: @/lib/utils
# - Modo de componentes: con CSS Modules
# - Incluir ejemplos de importaciones: No (para mantener el código limpio)
```

## Agregar Componentes de shadcn/ui

Instalar componentes específicos según se necesiten:

```bash
# Ejemplos de componentes útiles para empezar:
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add toast
```

## Estructura de Implementación

### Fase 1: Autenticación y Layout Principal
- [x] Implementar clientes API y funciones helper
- [ ] Crear componentes de layout principal
- [ ] Implementar página de inicio de sesión
- [ ] Agregar protección de rutas para áreas autenticadas

### Fase 2: Dashboard y Navegación
- [ ] Crear layout para secciones autenticadas
- [ ] Implementar sidebar y navegación principal
- [ ] Crear dashboard con resumen de información

### Fase 3: Módulos Principales
- [ ] Implementar CRUD de Menús
- [ ] Implementar CRUD de Productos
- [ ] Implementar CRUD de Categorías

### Fase 4: Funcionalidades Operativas
- [ ] Implementar gestión de Órdenes
- [ ] Implementar servicio a mesas
- [ ] Implementar reportes y estadísticas

## Rutas de Aplicación (Next.js App Router)

```
/src/app/
├── (auth)/                # Grupo de rutas autenticadas
│   ├── dashboard/         # Dashboard principal
│   ├── menus/             # Gestión de menús
│   ├── products/          # Gestión de productos
│   ├── orders/            # Gestión de órdenes
│   ├── categories/        # Gestión de categorías
│   ├── service-spots/     # Gestión de puestos de servicio
│   ├── sales-areas/       # Gestión de áreas de venta
│   └── settings/          # Configuración del sistema
├── login/                 # Página de inicio de sesión
└── register/              # Página de registro (opcional)
```

## Componentes Reutilizables

```
/src/components/
├── ui/                    # Componentes de UI (shadcn)
├── forms/                 # Formularios reutilizables
│   ├── login-form.tsx
│   ├── menu-form.tsx
│   └── product-form.tsx
├── layout/                # Componentes de layout
│   ├── sidebar.tsx
│   └── header.tsx
└── shared/                # Componentes compartidos
    ├── data-table.tsx
    └── status-badge.tsx
```

## Integración con el Backend

Para cada módulo:

1. Crear interfaces TypeScript para los modelos del backend
2. Implementar funciones de fetching de datos usando SWR o React Query
3. Crear formularios con validación usando React Hook Form
4. Asegurar que todas las peticiones incluyan el token de autenticación

## Estrategia de Desarrollo

1. Comenzar por la autenticación para establecer la infraestructura base
2. Implementar un módulo a la vez, completando todas sus funcionalidades (CRUD)
3. Priorizar las entidades principales (menús, productos) antes de las dependientes
4. Implementar componentes reutilizables para acelerar el desarrollo

## Pruebas y Depuración

1. Verificar las conexiones al backend usando las herramientas de desarrollo del navegador
2. Validar los datos recibidos y enviados en cada petición
3. Probar flujos completos (ej. crear producto → agregar a menú → crear orden)
