CREATE OR REPLACE PACKAGE pkg_inventory AS
    FUNCTION get_stock_level(p_item_id IN NUMBER) RETURN NUMBER;
    PROCEDURE update_stock(p_item_id IN NUMBER, p_quantity IN NUMBER);
END pkg_inventory;
/

CREATE OR REPLACE PACKAGE BODY pkg_inventory AS

    FUNCTION get_stock_level(p_item_id IN NUMBER) RETURN NUMBER IS
        v_stock NUMBER;
    BEGIN
        SELECT stock_qty INTO v_stock
        FROM inventory
        WHERE item_id = p_item_id;

        -- BUG: missing RETURN statement!

    END get_stock_level;

    PROCEDURE update_stock(p_item_id IN NUMBER, p_quantity IN NUMBER) IS
    BEGIN
        IF p_quantity > 0 THEN
            UPDATE inventory
            SET stock_qty = stock_qty + p_quantity
            WHERE item_id = p_item_id;

            -- BUG: missing END IF!

        UPDATE inventory
        SET last_updated = SYSDATE
        WHERE item_id = p_item_id;
    END update_stock;

END pkg_inventory;
/



