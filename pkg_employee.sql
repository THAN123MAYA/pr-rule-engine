create or replace package pkg_employee as
    PROCEDURE add_employee(
        p_name IN VARCHAR2,
        p_salary IN NUMBER
    );
    function get_employee_count return number;
end pkg_employee;
/

create or replace package body pkg_employee as

    PROCEDURE add_employee(
        p_name IN VARCHAR2,
        p_salary IN NUMBER
    ) IS
    BEGIN
        insert into employees (emp_name, emp_salary)
        VALUES (p_name, p_salary);

        if p_salary > 100000 then
            DBMS_OUTPUT.PUT_LINE('High earner added');
        end if;
    END add_employee;

    function get_employee_count return number IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) into v_count from employees;
        RETURN v_count;
    END get_employee_count;

END pkg_employee;
/
