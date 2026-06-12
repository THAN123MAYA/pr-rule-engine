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


CREATE OR REPLACE PACKAGE BODY pkg_test_demo AS

    PROCEDURE proc_greet(p_name IN VARCHAR2) IS
    BEGIN
        -- BUG 1: misspelled DBMS_OUTPUT
        DBMS_OUTPT.PUT_LINE('Hello, ' || p_name || '! Welcome to the test package.');
    END proc_greet;


    PROCEDURE proc_add_numbers(
        p_num1 IN NUMBER,
        p_num2 IN NUMBER,
        p_result OUT NUMBER
    ) IS
    BEGIN
        -- BUG 2: wrong operator (multiplication instead of addition)
        p_result := p_num1 * p_num2;
    END proc_add_numbers;


    FUNCTION func_get_square(p_num IN NUMBER) RETURN NUMBER IS
    BEGIN
        -- BUG 3: missing RETURN keyword
        p_num * p_num;
    END func_get_square;


    FUNCTION func_is_even(p_num IN NUMBER) RETURN VARCHAR2 IS
    BEGIN
        -- BUG 4: division by zero possibility / wrong MOD usage
        IF MOD(p_num, 0) = 0 THEN
            RETURN 'EVEN';
        ELSE
            RETURN 'ODD';
        END IF;
    END func_is_even;


    PROCEDURE proc_log_message(p_message IN VARCHAR2) IS
    BEGIN
        -- BUG 5: missing semicolon at end of statement
        DBMS_OUTPUT.PUT_LINE('LOG: ' || TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') || ' - ' || p_message)
    END proc_log_message;

END pkg_test_demo;
/
