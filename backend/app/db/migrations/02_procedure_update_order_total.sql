-- Procedure to update an order's total amount based on its items
DROP PROCEDURE IF EXISTS update_order_total;

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
END;
