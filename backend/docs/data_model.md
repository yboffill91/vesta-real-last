# Modelo de Datos para Sistema de Gestión de Restaurante (Vesta)

## Índice
1. [Descripción General](#descripción-general)
2. [Diagrama Entidad-Relación](#diagrama-entidad-relación)
3. [Entidades y Tablas](#entidades-y-tablas)
4. [Relaciones Principales](#relaciones-principales)
5. [Flujos de Datos](#flujos-de-datos)

## Descripción General

Este documento describe el modelo de datos para el sistema de gestión de restaurante Vesta. El sistema permite gestionar usuarios, configuración de local, áreas de venta, puestos de servicio, productos, cartas de menú, y comandas (pedidos).

## Diagrama Entidad-Relación

```
                                   ┌───────────┐
                                   │           │
                                ┌──┤   Users   │
                                │  │           │
                                │  └───────────┘
                                │        ▲
                                │        │ created_by/closed_by
┌─────────────┐                 │        │
│             │                 │  ┌───────────┐
│Establishment├─────────────────┼─►│           │
│             │                 │  │  Orders   │◄───┐
└──────┬──────┘                 │  │           │    │
       │                        │  └─────┬─────┘    │
       │                        │        │          │
       ▼                        │        ▼          │
┌─────────────┐                 │  ┌───────────┐    │
│             │    ┌──────────┐ │  │           │    │
│ SalesAreas  │◄───┤MenuSales │◄┼──┤   Menus   │    │
│             │    │  Areas   │ │  │           │    │
└──────┬──────┘    └──────────┘ │  └─────┬─────┘    │
       │                        │        │          │
       ▼                        │        ▼          │
┌─────────────┐                 │  ┌───────────┐    │
│             │                 │  │           │    │
│ServiceSpots │─────────────────┘  │ MenuItems │    │
│             │                    │           │    │
└─────────────┘                    └─────┬─────┘    │
                                         │          │
                                         ▼          │
                               ┌───────────────┐    │
                               │               │    │
                               │   Products    │◄───┼───┐
                               │               │    │   │
                               └───────┬───────┘    │   │
                                       │            │   │
                                       ▼            │   │
                               ┌───────────────┐    │   │
                               │               │    │   │
                               │ProductCategories   │   │
                               │               │    │   │
                               └───────────────┘    │   │
                                                    ▼   │
                                              ┌───────────┐
                                              │           │
                                              │OrderItems │
                                              │           │
                                              └───────────┘
```

## Entidades y Tablas

### 1. Users (Usuarios)
Almacena información sobre los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| name | VARCHAR(32) | Nombre del usuario |
| surname | VARCHAR(32) | Apellido del usuario |
| username | VARCHAR(32) | Nombre de usuario único |
| password | VARCHAR(255) | Contraseña hasheada |
| role | ENUM | Rol: 'Soporte', 'Administrador', 'Dependiente' |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| last_login | TIMESTAMP | Último acceso |

### 2. Establishment (Establecimiento)
Configuración del local o establecimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| name | VARCHAR(100) | Nombre del establecimiento |
| address | VARCHAR(255) | Dirección |
| phone | VARCHAR(20) | Teléfono |
| logo | VARCHAR(255) | Ruta a imagen del logo |
| tax_rate | DECIMAL(5,2) | Tasa de impuesto predeterminada |
| currency | VARCHAR(3) | Moneda (por defecto 'CUP') |
| is_configured | BOOLEAN | Indica si la config inicial está completa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### 3. SalesAreas (Áreas de Venta)
Diferentes áreas de venta dentro del establecimiento (Salón, Bar, etc.)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| establishment_id | INT | FK a Establishment |
| name | VARCHAR(50) | Nombre del área (Salón, Bar, etc.) |
| description | TEXT | Descripción opcional |
| is_active | BOOLEAN | Si está activa o no |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### 4. ServiceSpots (Puestos de Atención)
Puestos donde se atiende a los clientes (mesas, asientos en la barra, etc.)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| sales_area_id | INT | FK a SalesAreas |
| name | VARCHAR(50) | Nombre/número del puesto |
| capacity | INT | Capacidad (número de personas) |
| status | ENUM | 'libre', 'ocupado', 'reservado', 'pedido_abierto', 'cobrado' |
| is_active | BOOLEAN | Si está activo o no |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### 5. ProductCategories (Categorías de Productos)
Categorías para organizar los productos (Tragos, Bebidas, Entrantes, etc.)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| name | VARCHAR(50) | Nombre de la categoría |
| description | TEXT | Descripción opcional |
| is_active | BOOLEAN | Si está activa o no |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### 6. Products (Productos)
Productos ofrecidos por el establecimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| category_id | INT | FK a ProductCategories |
| name | VARCHAR(100) | Nombre del producto |
| description | TEXT | Descripción del producto |
| price | DECIMAL(10,2) | Precio base |
| image | VARCHAR(255) | Ruta a imagen del producto |
| is_available | BOOLEAN | Si está disponible para venta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| created_by | INT | FK a Users (quien creó el producto) |

### 7. Menus (Cartas de Menú)
Cartas o menús con validez diaria.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| name | VARCHAR(100) | Nombre de la carta |
| valid_date | DATE | Fecha de validez |
| status | ENUM | 'borrador', 'publicada', 'archivada' |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| created_by | INT | FK a Users (quien creó la carta) |

### 8. MenuSalesAreas (Relación Menú-Área)
Relación muchos a muchos entre Menus y SalesAreas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| menu_id | INT | PK, FK a Menus |
| sales_area_id | INT | PK, FK a SalesAreas |
| created_at | TIMESTAMP | Fecha de creación |

### 9. MenuItems (Ítems de Menú)
Productos incluidos en una carta específica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| menu_id | INT | FK a Menus |
| product_id | INT | FK a Products |
| price | DECIMAL(10,2) | Precio específico para esta carta |
| is_available | BOOLEAN | Disponibilidad específica para esta carta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### 10. Orders (Comandas/Pedidos)
Pedidos realizados por los clientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| service_spot_id | INT | FK a ServiceSpots |
| sales_area_id | INT | FK a SalesAreas |
| menu_id | INT | FK a Menus |
| status | ENUM | 'abierta', 'en_preparación', 'servida', 'cobrada', 'cancelada' |
| total_amount | DECIMAL(10,2) | Monto total |
| tax_amount | DECIMAL(10,2) | Monto de impuestos |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |
| closed_at | TIMESTAMP | Fecha de cierre (cobro) |
| created_by | INT | FK a Users (dependiente que creó la comanda) |
| closed_by | INT | FK a Users (dependiente que cerró la comanda) |

### 11. OrderItems (Ítems de Comanda)
Productos incluidos en una comanda específica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | PK, autoincremental |
| order_id | INT | FK a Orders |
| product_id | INT | FK a Products |
| quantity | INT | Cantidad |
| unit_price | DECIMAL(10,2) | Precio unitario al momento de la orden |
| total_price | DECIMAL(10,2) | Precio total (cantidad * precio unitario) |
| notes | TEXT | Notas especiales (sin cebolla, término medio, etc.) |
| status | ENUM | 'pendiente', 'en_preparación', 'listo', 'servido', 'cancelado' |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

## Relaciones Principales

1. **Usuario - Establecimiento**: Un usuario administrador configura el establecimiento.

2. **Establecimiento - Áreas**: Un establecimiento tiene múltiples áreas de venta.

3. **Áreas - Puestos**: Cada área contiene múltiples puestos de servicio (mesas, asientos).

4. **Áreas - Menús**: Relación muchos a muchos a través de la tabla MenuSalesAreas.

5. **Categorías - Productos**: Un producto pertenece a una categoría.

6. **Menús - Productos**: Relación muchos a muchos a través de la tabla MenuItems.

7. **Pedidos - Puestos**: Un pedido está asociado a un puesto de servicio.

8. **Pedidos - Productos**: Relación muchos a muchos a través de la tabla OrderItems.

9. **Usuario - Pedidos**: Un usuario (dependiente) crea y cierra pedidos.

## Flujos de Datos

### Configuración Inicial
1. Usuario de Soporte crea usuario Administrador
2. Administrador configura datos del establecimiento
3. Administrador define áreas de venta y puestos de servicio
4. Administrador crea categorías y productos

### Gestión de Menú
1. Administrador crea carta/menú para una fecha específica
2. Administrador asigna productos del inventario a la carta
3. Administrador publica carta y la asigna a áreas de venta

### Proceso de Pedido
1. Dependiente selecciona área y puesto de servicio
2. Dependiente crea nueva comanda asociada al puesto
3. Dependiente añade productos a la comanda desde el menú del día
4. El puesto cambia a estado 'pedido_abierto'
5. Dependiente actualiza estado de la comanda (servida, etc.)
6. Dependiente cierra la comanda (cobro)
7. El puesto cambia a estado 'cobrado' y luego a 'libre'

## Notas de Implementación

1. **Seguridad**: Todas las operaciones deben validarse según el rol del usuario.
2. **Validación**: Implementar validaciones para cambios de estado, disponibilidad y cálculos.
3. **Auditoría**: Las tablas incluyen campos de registro temporal y de usuario para auditoría.
4. **Notificaciones**: Implementar verificación de configuración para mostrar notificaciones.
5. **Escalabilidad**: El diseño permite futuras extensiones como gestión de inventario y reservas.
