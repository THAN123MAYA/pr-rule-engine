create or replace package pkg_inventory as
    function get_stock_level(p_item_id in number) return number;
    procedure update_stock(p_item_id in number, p_quantity in number);
end pkg_inventory;
/

create or replace package body pkg_inventory as

    function get_stock_level(p_item_id in number) return number is
        v_stock number;
    begin
        select stock_qty into v_stock
        from inventory
        where item_id = p_item_id;

        -- BUG: missing RETURN statement!
    end get_stock_level;

    procedure update_stock(p_item_id in number, p_quantity in number) is
    begin
        if p_quantity > 0 then
            update inventory
            set stock_qty = stock_qty + p_quantity
            where item_id = p_item_id;

            -- BUG: missing END IF!

        update inventory
        set last_updated = sysdate
        where item_id = p_item_id;
    end update_stock;

end pkg_inventory;
/
