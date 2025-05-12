# Vesta Restaurant System - Casos de Uso

Este documento describe los principales flujos de casos de uso del sistema Vesta, organizados por rol de usuario.

## Roles de Usuario

El sistema contempla tres roles principales:

- **Soporte**: Acceso total al sistema, incluida la configuración técnica.
- **Administrador**: Gestión completa del negocio y sus operaciones.
- **Dependiente**: Operación diaria de atención al cliente y gestión de pedidos.

## Flujos de Casos de Uso

### 1. Configuración Inicial del Restaurante (Soporte)

**Actor Principal**: Usuario con rol Soporte
**Objetivo**: Configurar los parámetros iniciales del establecimiento

```mermaid
sequenceDiagram
    actor Soporte
    participant Sistema
    participant BD as Base de Datos
    
    Soporte->>Sistema: Iniciar sesión (credenciales)
    Sistema->>Sistema: Validar credenciales
    Sistema->>Soporte: Mostrar panel de administración
    Soporte->>Sistema: Acceder a Configuración
    Sistema->>BD: Obtener configuración actual
    BD->>Sistema: Devolver configuración
    Sistema->>Soporte: Mostrar formulario de configuración
    Soporte->>Sistema: Introducir datos del establecimiento (nombre, dirección, etc.)
    Sistema->>BD: Guardar configuración
    BD->>Sistema: Confirmar guardado
    Sistema->>Soporte: Notificar éxito de configuración
```

**Pasos detallados**:
1. El usuario Soporte inicia sesión en el sistema.
2. Accede a la sección de configuración del sistema.
3. Introduce la información básica del establecimiento:
   - Nombre del restaurante
   - Dirección
   - Teléfono
   - Logo
   - Tasa de impuestos aplicable
   - Moneda
4. El sistema guarda la configuración y marca el establecimiento como configurado.
5. El Soporte procede a configurar áreas de venta y puestos de servicio.

### 2. Gestión de Usuarios (Administrador)

**Actor Principal**: Usuario con rol Administrador
**Objetivo**: Crear, modificar o desactivar usuarios del sistema

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant Sistema
    participant BD as Base de Datos
    
    Admin->>Sistema: Iniciar sesión
    Sistema->>Admin: Mostrar panel de administración
    Admin->>Sistema: Acceder a Gestión de Usuarios
    Sistema->>BD: Obtener lista de usuarios
    BD->>Sistema: Devolver usuarios
    Sistema->>Admin: Mostrar lista de usuarios
    
    opt Crear nuevo usuario
        Admin->>Sistema: Seleccionar "Crear usuario"
        Sistema->>Admin: Mostrar formulario
        Admin->>Sistema: Introducir datos (nombre, rol, etc.)
        Sistema->>BD: Guardar nuevo usuario
        BD->>Sistema: Confirmar creación
        Sistema->>Admin: Notificar éxito
    end
    
    opt Modificar usuario
        Admin->>Sistema: Seleccionar usuario
        Sistema->>BD: Obtener datos completos
        BD->>Sistema: Devolver datos
        Sistema->>Admin: Mostrar formulario con datos
        Admin->>Sistema: Modificar datos
        Sistema->>BD: Actualizar usuario
        BD->>Sistema: Confirmar actualización
        Sistema->>Admin: Notificar éxito
    end
    
    opt Desactivar usuario
        Admin->>Sistema: Seleccionar usuario
        Admin->>Sistema: Seleccionar "Desactivar"
        Sistema->>Admin: Solicitar confirmación
        Admin->>Sistema: Confirmar desactivación
        Sistema->>BD: Marcar usuario como inactivo
        BD->>Sistema: Confirmar cambio
        Sistema->>Admin: Notificar éxito
    end
```

**Pasos detallados**:
1. El Administrador accede a la sección de gestión de usuarios.
2. El sistema muestra la lista de usuarios actuales.
3. Para crear un nuevo usuario:
   - Selecciona "Crear Usuario"
   - Introduce nombre, apellido, nombre de usuario, contraseña y rol asignado
   - Guarda los cambios
4. Para modificar un usuario:
   - Selecciona el usuario de la lista
   - Modifica los campos necesarios
   - Guarda los cambios
5. Para desactivar un usuario:
   - Selecciona el usuario
   - Selecciona la opción "Desactivar"
   - Confirma la acción

### 3. Gestión de Productos y Categorías (Administrador)

**Actor Principal**: Usuario con rol Administrador
**Objetivo**: Administrar el catálogo de productos

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant Sistema
    participant BD as Base de Datos
    
    Admin->>Sistema: Acceder a Gestión de Productos
    Sistema->>BD: Obtener categorías y productos
    BD->>Sistema: Devolver datos
    Sistema->>Admin: Mostrar catálogo
    
    opt Crear categoría
        Admin->>Sistema: Seleccionar "Nueva Categoría"
        Admin->>Sistema: Introducir nombre y descripción
        Sistema->>BD: Guardar nueva categoría
        BD->>Sistema: Confirmar creación
        Sistema->>Admin: Actualizar vista
    end
    
    opt Crear producto
        Admin->>Sistema: Seleccionar "Nuevo Producto"
        Sistema->>Admin: Mostrar formulario
        Admin->>Sistema: Introducir datos de producto (nombre, precio, etc.)
        Admin->>Sistema: Seleccionar categoría
        Admin->>Sistema: Cargar imagen (opcional)
        Sistema->>BD: Guardar nuevo producto
        BD->>Sistema: Confirmar creación
        Sistema->>Admin: Actualizar catálogo
    end
    
    opt Modificar producto
        Admin->>Sistema: Seleccionar producto
        Sistema->>BD: Obtener datos completos
        BD->>Sistema: Devolver datos
        Sistema->>Admin: Mostrar formulario con datos
        Admin->>Sistema: Modificar datos
        Sistema->>BD: Actualizar producto
        BD->>Sistema: Confirmar actualización
        Sistema->>Admin: Notificar éxito
    end
    
    opt Gestionar disponibilidad
        Admin->>Sistema: Seleccionar producto
        Admin->>Sistema: Cambiar disponibilidad
        Sistema->>BD: Actualizar disponibilidad
        BD->>Sistema: Confirmar cambio
        Sistema->>Admin: Actualizar vista
    end
```

**Pasos detallados**:
1. El Administrador accede a la sección de gestión de productos.
2. El sistema muestra el catálogo organizado por categorías.
3. Para crear una nueva categoría:
   - Selecciona "Nueva Categoría"
   - Introduce nombre y descripción
   - Guarda la categoría
4. Para crear un nuevo producto:
   - Selecciona "Nuevo Producto"
   - Introduce nombre, descripción, precio
   - Selecciona la categoría
   - Opcionalmente carga una imagen
   - Guarda el producto
5. Para modificar un producto:
   - Selecciona el producto del catálogo
   - Modifica los datos necesarios
   - Guarda los cambios
6. Para gestionar disponibilidad:
   - Selecciona el producto
   - Marca o desmarca como disponible
   - Guarda el cambio

### 4. Gestión de Cartas/Menús (Administrador)

**Actor Principal**: Usuario con rol Administrador
**Objetivo**: Crear y gestionar cartas o menús

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant Sistema
    participant BD as Base de Datos
    
    Admin->>Sistema: Acceder a Gestión de Menús
    Sistema->>BD: Obtener menús actuales
    BD->>Sistema: Devolver menús
    Sistema->>Admin: Mostrar lista de menús
    
    opt Crear menú
        Admin->>Sistema: Seleccionar "Nuevo Menú"
        Sistema->>Admin: Mostrar formulario
        Admin->>Sistema: Introducir nombre y fecha
        Sistema->>BD: Crear menú en estado borrador
        BD->>Sistema: Devolver ID del menú
        Sistema->>Admin: Mostrar menú para edición
        
        loop Añadir productos
            Admin->>Sistema: Buscar y seleccionar producto
            Admin->>Sistema: Establecer precio en menú
            Sistema->>BD: Añadir ítem al menú
            BD->>Sistema: Confirmar adición
            Sistema->>Admin: Actualizar vista
        end
        
        Admin->>Sistema: Seleccionar áreas de venta aplicables
        Sistema->>BD: Asignar menú a áreas
        BD->>Sistema: Confirmar asignación
        
        Admin->>Sistema: Seleccionar "Publicar"
        Sistema->>BD: Cambiar estado a publicado
        BD->>Sistema: Confirmar cambio
        Sistema->>Admin: Notificar publicación exitosa
    end
    
    opt Modificar menú
        Admin->>Sistema: Seleccionar menú existente
        Sistema->>BD: Obtener detalles del menú
        BD->>Sistema: Devolver datos completos
        Sistema->>Admin: Mostrar menú para edición
        Admin->>Sistema: Realizar cambios
        Sistema->>BD: Actualizar menú
        BD->>Sistema: Confirmar actualización
        Sistema->>Admin: Notificar éxito
    end
    
    opt Archivar menú
        Admin->>Sistema: Seleccionar menú
        Admin->>Sistema: Seleccionar "Archivar"
        Sistema->>BD: Cambiar estado a archivado
        BD->>Sistema: Confirmar cambio
        Sistema->>Admin: Actualizar vista
    end
```

**Pasos detallados**:
1. El Administrador accede a la gestión de menús.
2. Para crear un nuevo menú:
   - Selecciona "Nuevo Menú"
   - Introduce nombre y fecha de validez
   - Selecciona productos y establece precios específicos para el menú
   - Asigna el menú a áreas de venta específicas
   - Publica el menú cuando esté listo
3. Para modificar un menú:
   - Selecciona el menú a modificar
   - Realiza los cambios necesarios (añadir/quitar productos, cambiar precios)
   - Guarda los cambios
4. Para archivar un menú:
   - Selecciona el menú
   - Elige la opción "Archivar"
   - Confirma la acción

### 5. Toma de Pedidos (Dependiente)

**Actor Principal**: Usuario con rol Dependiente
**Objetivo**: Registrar y gestionar pedidos de clientes

```mermaid
sequenceDiagram
    actor Dependiente
    participant Sistema
    participant BD as Base de Datos
    
    Dependiente->>Sistema: Iniciar sesión
    Sistema->>Dependiente: Mostrar panel de dependiente
    Dependiente->>Sistema: Seleccionar área de venta
    Sistema->>BD: Obtener puestos de servicio
    BD->>Sistema: Devolver puestos
    Sistema->>Dependiente: Mostrar diagrama con puestos
    
    Dependiente->>Sistema: Seleccionar puesto libre
    Sistema->>BD: Verificar estado
    BD->>Sistema: Confirmar disponibilidad
    Sistema->>Dependiente: Mostrar menús disponibles
    Dependiente->>Sistema: Seleccionar menú
    
    Sistema->>BD: Crear nuevo pedido
    BD->>Sistema: Devolver ID de pedido
    Sistema->>BD: Actualizar estado del puesto
    BD->>Sistema: Confirmar actualización
    
    Sistema->>Dependiente: Mostrar catálogo de productos
    
    loop Añadir productos
        Dependiente->>Sistema: Seleccionar categoría
        Sistema->>Dependiente: Mostrar productos
        Dependiente->>Sistema: Seleccionar producto
        Dependiente->>Sistema: Especificar cantidad
        Dependiente->>Sistema: Añadir notas (opcional)
        Sistema->>BD: Añadir ítem al pedido
        BD->>Sistema: Confirmar adición
        Sistema->>Dependiente: Actualizar vista del pedido
    end
    
    Dependiente->>Sistema: Finalizar pedido
    Sistema->>BD: Actualizar estado del pedido
    BD->>Sistema: Confirmar actualización
    Sistema->>Dependiente: Mostrar resumen del pedido
```

**Pasos detallados**:
1. El Dependiente inicia sesión y accede al panel de atención.
2. Selecciona el área de venta donde se encuentra (salón, barra, etc.).
3. El sistema muestra un diagrama con los puestos de servicio y su estado.
4. Para iniciar un nuevo pedido:
   - Selecciona un puesto libre o reservado
   - Elige el menú aplicable
   - El sistema crea un nuevo pedido y cambia el estado del puesto
5. Para añadir productos al pedido:
   - Navega por las categorías
   - Selecciona productos
   - Especifica cantidad y notas especiales
   - Confirma la adición
6. Finaliza el pedido cuando esté completo.

### 6. Procesamiento de Pedidos (Dependiente)

**Actor Principal**: Usuario con rol Dependiente
**Objetivo**: Gestionar el ciclo de vida de los pedidos activos

```mermaid
sequenceDiagram
    actor Dependiente
    participant Sistema
    participant BD as Base de Datos
    
    Dependiente->>Sistema: Acceder a Pedidos Activos
    Sistema->>BD: Obtener pedidos en curso
    BD->>Sistema: Devolver pedidos
    Sistema->>Dependiente: Mostrar lista de pedidos
    
    opt Modificar pedido
        Dependiente->>Sistema: Seleccionar pedido
        Sistema->>BD: Obtener detalles completos
        BD->>Sistema: Devolver datos
        Sistema->>Dependiente: Mostrar pedido para edición
        
        opt Añadir más productos
            Dependiente->>Sistema: Seleccionar "Añadir productos"
            Sistema->>Dependiente: Mostrar catálogo
            Dependiente->>Sistema: Seleccionar productos
            Sistema->>BD: Actualizar pedido
            BD->>Sistema: Confirmar actualización
            Sistema->>Dependiente: Actualizar vista
        end
        
        opt Cancelar ítem
            Dependiente->>Sistema: Seleccionar ítem
            Dependiente->>Sistema: Seleccionar "Cancelar"
            Sistema->>BD: Marcar ítem como cancelado
            BD->>Sistema: Confirmar cambio
            Sistema->>Dependiente: Actualizar vista
        end
    end
    
    opt Marcar como servido
        Dependiente->>Sistema: Seleccionar pedido
        Dependiente->>Sistema: Seleccionar "Marcar como servido"
        Sistema->>BD: Actualizar estado
        BD->>Sistema: Confirmar cambio
        Sistema->>Dependiente: Actualizar vista
    end
    
    opt Procesar pago
        Dependiente->>Sistema: Seleccionar pedido
        Dependiente->>Sistema: Seleccionar "Cobrar"
        Sistema->>BD: Calcular total con impuestos
        BD->>Sistema: Devolver total
        Sistema->>Dependiente: Mostrar desglose y total
        Dependiente->>Sistema: Confirmar pago
        Sistema->>BD: Marcar pedido como cobrado
        Sistema->>BD: Actualizar estado del puesto
        BD->>Sistema: Confirmar cambios
        Sistema->>Dependiente: Mostrar comprobante de pago
    end
    
    opt Cancelar pedido
        Dependiente->>Sistema: Seleccionar pedido
        Dependiente->>Sistema: Seleccionar "Cancelar pedido"
        Sistema->>Dependiente: Solicitar motivo
        Dependiente->>Sistema: Introducir motivo
        Sistema->>BD: Marcar pedido como cancelado
        Sistema->>BD: Liberar puesto de servicio
        BD->>Sistema: Confirmar cambios
        Sistema->>Dependiente: Notificar cancelación exitosa
    end
```

**Pasos detallados**:
1. El Dependiente accede a la vista de pedidos activos.
2. Para modificar un pedido:
   - Selecciona el pedido de la lista
   - Añade nuevos productos o modifica cantidades
   - Guarda los cambios
3. Para marcar ítems como servidos:
   - Selecciona el pedido
   - Marca los ítems correspondientes como servidos
   - Confirma el cambio
4. Para procesar el pago:
   - Selecciona el pedido
   - Elige la opción "Cobrar"
   - Verifica el total con impuestos
   - Confirma el pago
   - El sistema genera el comprobante
5. Para cancelar un pedido:
   - Selecciona el pedido
   - Elige "Cancelar"
   - Introduce el motivo de cancelación
   - Confirma la acción

### 7. Reportes y Estadísticas (Administrador)

**Actor Principal**: Usuario con rol Administrador
**Objetivo**: Obtener reportes y estadísticas del negocio

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant Sistema
    participant BD as Base de Datos
    
    Admin->>Sistema: Acceder a Informes
    Sistema->>Admin: Mostrar opciones de reportes
    
    opt Reporte de ventas diarias
        Admin->>Sistema: Seleccionar "Ventas Diarias"
        Admin->>Sistema: Especificar fecha
        Sistema->>BD: Consultar ventas
        BD->>Sistema: Devolver datos
        Sistema->>Admin: Mostrar gráfico y tabla de ventas
        opt Exportar
            Admin->>Sistema: Seleccionar "Exportar"
            Sistema->>Admin: Descargar PDF/Excel
        end
    end
    
    opt Reporte de productos más vendidos
        Admin->>Sistema: Seleccionar "Productos Más Vendidos"
        Admin->>Sistema: Seleccionar período
        Sistema->>BD: Consultar datos
        BD->>Sistema: Devolver estadísticas
        Sistema->>Admin: Mostrar ranking y gráficos
    end
    
    opt Ocupación por áreas
        Admin->>Sistema: Seleccionar "Ocupación"
        Sistema->>BD: Consultar datos históricos
        BD->>Sistema: Devolver estadísticas
        Sistema->>Admin: Mostrar mapa de calor y gráficos
    end
    
    opt Rendimiento de dependientes
        Admin->>Sistema: Seleccionar "Rendimiento Personal"
        Admin->>Sistema: Seleccionar período
        Sistema->>BD: Consultar datos
        BD->>Sistema: Devolver estadísticas
        Sistema->>Admin: Mostrar tablas comparativas
    end
```

**Pasos detallados**:
1. El Administrador accede a la sección de informes.
2. Para el reporte de ventas diarias:
   - Selecciona "Ventas Diarias"
   - Especifica la fecha o rango
   - Visualiza gráficos y tablas de datos
   - Opcionalmente exporta los datos
3. Para el reporte de productos más vendidos:
   - Selecciona "Productos Más Vendidos"
   - Establece el período de análisis
   - Visualiza el ranking y gráficos
4. Para analizar la ocupación:
   - Selecciona "Ocupación por Áreas"
   - Visualiza mapas de calor y estadísticas
5. Para evaluar el rendimiento del personal:
   - Selecciona "Rendimiento Personal"
   - Establece el período
   - Analiza las estadísticas comparativas

## Flujos de Excepción

### E1. Fallo de Autenticación

```mermaid
sequenceDiagram
    actor Usuario
    participant Sistema
    participant BD as Base de Datos
    
    Usuario->>Sistema: Introducir credenciales
    Sistema->>BD: Verificar credenciales
    BD->>Sistema: Credenciales inválidas
    Sistema->>Usuario: Mostrar error "Credenciales incorrectas"
    Sistema->>BD: Registrar intento fallido
    
    alt Múltiples intentos fallidos
        Sistema->>Usuario: Bloquear cuenta temporalmente
        Sistema->>BD: Registrar bloqueo
    end
```

### E2. Error en Procesamiento de Pedido

```mermaid
sequenceDiagram
    actor Dependiente
    participant Sistema
    participant BD as Base de Datos
    
    Dependiente->>Sistema: Intentar crear pedido
    Sistema->>BD: Crear pedido
    BD->>Sistema: Error (puesto ocupado, producto no disponible, etc.)
    Sistema->>Dependiente: Mostrar mensaje de error específico
    Sistema->>Dependiente: Sugerir alternativa (cambiar puesto, eliminar producto)
```

## Notas Adicionales

- Los diagramas de flujo muestran las interacciones principales, pero pueden simplificarse en la implementación real.
- Se recomienda implementar validaciones en cada paso para prevenir inconsistencias.
- El sistema debe mantener logs detallados de las acciones críticas para auditoría.
