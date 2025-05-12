# Estructura de carpetas del proyecto frontend

/frontend
├── src/
│   ├── app/                     # App Router de Next.js
│   │   ├── (auth)/              # Rutas protegidas con autenticación
│   │   │   ├── dashboard/       # Panel principal
│   │   │   ├── menus/           # Gestión de menús
│   │   │   ├── products/        # Gestión de productos
│   │   │   ├── orders/          # Gestión de órdenes
│   │   │   └── layout.tsx       # Layout para rutas autenticadas
│   │   ├── login/               # Página de login
│   │   ├── register/            # Página de registro
│   │   ├── api/                 # API routes (proxy al backend si es necesario)
│   │   ├── layout.tsx           # Layout principal
│   │   └── page.tsx             # Página de inicio
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes básicos de UI
│   │   ├── forms/               # Componentes de formularios
│   │   └── layouts/             # Componentes de layout
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── api.ts               # Cliente para la API backend
│   │   ├── auth.ts              # Utilidades de autenticación
│   │   └── utils.ts             # Funciones de utilidad
│   ├── types/                   # Definiciones de tipos TypeScript
│   │   └── api.ts               # Tipos para interfaces de API
│   └── hooks/                   # Custom hooks
│       ├── useAuth.ts           # Hook para autenticación
│       └── useApi.ts            # Hook para consumir la API
└── public/                      # Archivos estáticos