# Guía para Crear Procedimientos Almacenados en phpMyAdmin

## Introducción

Esta guía explica cómo crear manualmente los procedimientos almacenados necesarios para el sistema Vesta usando phpMyAdmin. Estos procedimientos son necesarios para el correcto funcionamiento de las órdenes y puestos de servicio.

## Requisitos Previos

- Acceso a phpMyAdmin de tu base de datos MySQL
- Credenciales de administrador para la base de datos
- Base de datos `vestasys` ya creada
- Tablas de la base de datos ya creadas mediante los scripts de migración

## Método de Creación Recomendado

Utiliza el editor de rutinas de phpMyAdmin en lugar de ejecutar SQL directamente, ya que el editor gestiona correctamente la sintaxis y los delimitadores:

1. Accede a phpMyAdmin y selecciona la base de datos `vestasys`
2. Haz clic en la pestaña "Rutinas" (o "Procedimientos")
3. Haz clic en "Agregar rutina" o "Nueva rutina"
4. Completa el formulario con los datos del procedimiento
5. Guarda y verifica la creación exitosa

## Procedimiento 1: Actualización del Total de la Orden

Este procedimiento actualiza automáticamente el total de una orden basado en sus elementos y el impuesto configurado.

### Creación del Procedimiento `update_order_total`

#### Opción 1: Usando el editor de rutinas (RECOMENDADO)

1. Ve a la pestaña "Rutinas" y haz clic en "Agregar rutina"
2. Completa el formulario con:
   - **Nombre de la rutina**: `update_order_total`
   - **Tipo**: `PROCEDURE`
   - **Parámetros**: `IN p_order_id INT`
3. En el cuadro de código, pega el cuerpo del procedimiento:

```sql
-- Variables for tax calculation
DECLARE v_tax_rate DECIMAL(5,2) DEFAULT 0;
DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
DECLARE v_tax_amount DECIMAL(10,2) DEFAULT 0;
DECLARE v_total_amount DECIMAL(10,2) DEFAULT 0;

-- Get the establishment tax rate
SELECT COALESCE(tax_rate, 0) INTO v_tax_rate
FROM Establishment
LIMIT 1;

-- Calculate subtotal from order items
SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
FROM OrderItems
WHERE order_id = p_order_id;

-- Calculate tax amount
SET v_tax_amount = v_subtotal * (v_tax_rate / 100);

-- Calculate total amount
SET v_total_amount = v_subtotal + v_tax_amount;

-- Update the order
UPDATE Orders
SET total_amount = v_total_amount,
    tax_amount = v_tax_amount
WHERE id = p_order_id;
```

4. Haz clic en "Guardar" o "OK"

#### Opción 2: Usando SQL directo (si insistes en usar SQL)

1. Primero, elimina cualquier procedimiento existente:

```sql
DROP PROCEDURE IF EXISTS update_order_total;
```

2. Después de ejecutar lo anterior, crea el procedimiento con esta sintaxis específica:

```sql
CREATE PROCEDURE `update_order_total` (IN `p_order_id` INT)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
    -- Variables for tax calculation
    DECLARE v_tax_rate DECIMAL(5,2) DEFAULT 0;
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_tax_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_amount DECIMAL(10,2) DEFAULT 0;
    
    -- Get the establishment tax rate
    SELECT COALESCE(tax_rate, 0) INTO v_tax_rate
    FROM Establishment
    LIMIT 1;
    
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
    FROM OrderItems
    WHERE order_id = p_order_id;
    
    -- Calculate tax amount
    SET v_tax_amount = v_subtotal * (v_tax_rate / 100);
    
    -- Calculate total amount
    SET v_total_amount = v_subtotal + v_tax_amount;
    
    -- Update the order
    UPDATE Orders
    SET total_amount = v_total_amount,
        tax_amount = v_tax_amount
    WHERE id = p_order_id;
END
```

## Procedimiento 2: Actualización del Estado del Puesto de Servicio

Este procedimiento actualiza automáticamente el estado de un puesto de servicio (mesa) basado en las órdenes asociadas.

### Creación del Procedimiento `update_spot_status`

#### Opción 1: Usando el editor de rutinas (RECOMENDADO)

1. Ve a la pestaña "Rutinas" y haz clic en "Agregar rutina"
2. Completa el formulario con:
   - **Nombre de la rutina**: `update_spot_status`
   - **Tipo**: `PROCEDURE`
   - **Parámetros**: `IN p_spot_id INT`
3. En el cuadro de código, pega el cuerpo del procedimiento:

```sql
-- Variables for spot status
DECLARE v_has_active_orders INT DEFAULT 0;
DECLARE v_new_status VARCHAR(20) DEFAULT 'libre';

-- Check if there are active orders for this spot
SELECT COUNT(*) INTO v_has_active_orders
FROM Orders
WHERE service_spot_id = p_spot_id
AND status IN ('abierta', 'en_preparación', 'servida');

-- Determine the new status
IF v_has_active_orders > 0 THEN
    SET v_new_status = 'pedido_abierto';
ELSE
    -- Check if there are paid orders (might need cleaning/resetting)
    SELECT COUNT(*) INTO v_has_active_orders
    FROM Orders
    WHERE service_spot_id = p_spot_id
    AND status = 'cobrada'
    AND DATE(closed_at) = CURRENT_DATE();
    
    IF v_has_active_orders > 0 THEN
        SET v_new_status = 'cobrado';
    ELSE
        SET v_new_status = 'libre';
    END IF;
END IF;

-- Update the spot status
UPDATE ServiceSpots
SET status = v_new_status
WHERE id = p_spot_id;
```

4. Haz clic en "Guardar" o "OK"

#### Opción 2: Usando SQL directo (si insistes en usar SQL)

1. Primero, elimina cualquier procedimiento existente:

```sql
DROP PROCEDURE IF EXISTS update_spot_status;
```

2. Después de ejecutar lo anterior, crea el procedimiento con esta sintaxis específica:

```sql
CREATE PROCEDURE `update_spot_status` (IN `p_spot_id` INT)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
    -- Variables for spot status
    DECLARE v_has_active_orders INT DEFAULT 0;
    DECLARE v_new_status VARCHAR(20) DEFAULT 'libre';
    
    -- Check if there are active orders for this spot
    SELECT COUNT(*) INTO v_has_active_orders
    FROM Orders
    WHERE service_spot_id = p_spot_id
    AND status IN ('abierta', 'en_preparación', 'servida');
    
    -- Determine the new status
    IF v_has_active_orders > 0 THEN
        SET v_new_status = 'pedido_abierto';
    ELSE
        -- Check if there are paid orders (might need cleaning/resetting)
        SELECT COUNT(*) INTO v_has_active_orders
        FROM Orders
        WHERE service_spot_id = p_spot_id
        AND status = 'cobrada'
        AND DATE(closed_at) = CURRENT_DATE();
        
        IF v_has_active_orders > 0 THEN
            SET v_new_status = 'cobrado';
        ELSE
            SET v_new_status = 'libre';
        END IF;
    END IF;
    
    -- Update the spot status
    UPDATE ServiceSpots
    SET status = v_new_status
    WHERE id = p_spot_id;
END
```

## Solución de Problemas Comunes

### Errores de `You have an error in your SQL syntax` 

Este es un error común que puede deberse a varias razones:

1. **Solución 1**: Usa el editor de rutinas de phpMyAdmin en lugar de SQL directo
2. **Solución 2**: Si usas SQL directo, asegúrate de:
   - Inicializar las variables con `DEFAULT 0` u otro valor predeterminado
   - Usar backticks (\`) alrededor de los nombres de procedimientos y parámetros
   - Incluir los atributos del procedimiento (LANGUAGE SQL, NOT DETERMINISTIC, etc.)
   - NO incluir punto y coma al final de END (simplemente usa `END`)
   - NO usar DELIMITER en phpMyAdmin (se maneja automáticamente)

### Error de Objeto Existente

Si recibes un error como `Procedure already exists`, asegúrate de ejecutar primero el comando DROP PROCEDURE por separado antes de crear el nuevo procedimiento.

## Verificación de los Procedimientos Almacenados

Para verificar que los procedimientos se han creado correctamente:

1. En phpMyAdmin, selecciona la base de datos `vestasys`
2. Haz clic en "Rutinas" o "Procedimientos" en el menú lateral
3. Deberías ver `update_order_total` y `update_spot_status` en la lista

Para probar un procedimiento:

1. Haz clic en "Ejecutar" junto al procedimiento
2. Introduce los parámetros requeridos (por ejemplo, un ID de orden o spot válido)
3. Verifica que los valores en las tablas se actualizan correctamente

## Notas Adicionales

- Estos procedimientos se invocan automáticamente desde el código de la API
- En la actualización de órdenes (`PUT /orders/{id}`)
- En el cambio de estado de órdenes (`PATCH /orders/{id}/status`)
- Al añadir o eliminar elementos de órdenes
- Al eliminar órdenes

## Solución de Problemas Comunes

### Error de Sintaxis

Si recibes un error de sintaxis como:
```
You have an error in your SQL syntax; check the manual...
```

Verifica los siguientes aspectos:
- Asegúrate de que no hay DELIMITER declaraciones en el código (phpMyAdmin maneja esto automáticamente)
- Revisa que cada instrucción termine con punto y coma (;)
- Asegúrate de que las palabras reservadas estén escritas correctamente

### Error de Objeto Existente

Si recibes un error como:
```
Procedure 'update_order_total' already exists
```

Asegúrate de incluir la línea `DROP PROCEDURE IF EXISTS nombre_procedimiento;` antes de CREATE PROCEDURE.

### Error de Referencia a Tablas o Columnas

Si recibes un error como:
```
Table 'vestasys.tablename' doesn't exist
```

Verifica:
- Que la tabla mencionada exista en la base de datos
- Que el nombre de la tabla esté escrito correctamente (sensible a mayúsculas y minúsculas)
- Que las columnas referenciadas existan en la tabla

## Verificación de los Procedimientos Almacenados

Para verificar que los procedimientos se han creado correctamente:

1. En phpMyAdmin, selecciona la base de datos `vestasys`
2. Haz clic en "Rutinas" o "Procedimientos" en el menú lateral
3. Deberías ver `update_order_total` y `update_spot_status` en la lista

Para probar un procedimiento:

1. Haz clic en "Ejecutar" junto al procedimiento
2. Introduce los parámetros requeridos (por ejemplo, un ID de orden válido)
3. Verifica que los valores en las tablas se actualizan correctamente

## Notas Adicionales

- Estos procedimientos se invocan automáticamente desde el código de la API
- En la actualización de órdenes (`PUT /orders/{id}`)
- En el cambio de estado de órdenes (`PATCH /orders/{id}/status`)
- Al añadir o eliminar elementos de órdenes
- Al eliminar órdenes

Es importante que estos procedimientos existan y funcionen correctamente para que la aplicación pueda gestionar adecuadamente los estados de las órdenes y puestos de servicio.
