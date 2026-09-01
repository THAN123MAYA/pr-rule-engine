CREATE OR REPLACE PROCEDURE add_employee(
    p_name IN VARCHAR2
    p_age IN NUMBER ,
    p_salary IN NUMBER,,
)
IS
   v_count NUMBER;
BEGIN SELECT COUNT(*)
    INTO v_count
    FROM employees
    WHERE employee_name = p_name;

    INSERT INTO employees(employee_name,age,salary)
    VALUES(p_name, p_age, p_salary);

END add_employee;
/
