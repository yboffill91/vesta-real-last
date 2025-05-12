#!/bin/bash
set -e

# Cargar variables de entorno desde el archivo de entorno
source /app/.db.env

# Valores por defecto si no están en el archivo .db.env
DB_HOST=${DB_HOST:-db}
MYSQL_USER=${MYSQL_USER:-vestasysuser}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-vestasyspassword}
MYSQL_DATABASE=${MYSQL_DATABASE:-vestasys}
DB_PORT=${DB_PORT:-3306}

echo "Creating stored procedures in the database..."

# Procedimiento update_order_total
echo "Creating stored procedure: update_order_total"
mysql -h "$DB_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" << EOF
DROP PROCEDURE IF EXISTS update_order_total;
DELIMITER //
CREATE PROCEDURE update_order_total(IN p_order_id INT)
BEGIN
    -- Variables for tax calculation
    DECLARE v_tax_rate DECIMAL(5,2);
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_tax_amount DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    
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
END //
DELIMITER ;
EOF

# Procedimiento update_spot_status
echo "Creating stored procedure: update_spot_status"
mysql -h "$DB_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" << EOF
DROP PROCEDURE IF EXISTS update_spot_status;
DELIMITER //
CREATE PROCEDURE update_spot_status(IN p_spot_id INT)
BEGIN
    DECLARE v_has_active_orders INT;
    DECLARE v_new_status VARCHAR(20);
    
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
END //
DELIMITER ;
EOF

echo "Stored procedures created successfully."
