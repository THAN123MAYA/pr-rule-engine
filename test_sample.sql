CREATE OR REPLACE PACKAGE pkg_test_demo AS

    PROCEDURE proc_greet(p_name IN VARCHAR2);

    PROCEDURE proc_add_numbers(
        p_num1 IN NUMBER,
        p_num2 IN NUMBER,
        p_result OUT NUMBER
    );

    FUNCTION func_get_square(p_num IN NUMBER) RETURN NUMBER;

    FUNCTION func_is_even(p_num IN NUMBER) RETURN VARCHAR2;

    PROCEDURE proc_log_message(p_message IN VARCHAR2);

END pkg_test_demo;
/
