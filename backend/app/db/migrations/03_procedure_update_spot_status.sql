-- Procedure to check and update a service spot status based on its orders
DROP PROCEDURE IF EXISTS update_spot_status;

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
END;
