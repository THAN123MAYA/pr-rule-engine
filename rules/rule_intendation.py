"""
RULE: PL/SQL Style Checker
───────────────────────────
Checks:
  1. No space before comma
  2. Space required after comma
  3. No duplicate commas
  4. No trailing comma before ')'
  5. Each parameter must be on its own line
  6. Missing comma between parameters
  7. Indentation must be multiples of 4 spaces
  8. BEGIN must be on its own line
"""

import re

RULE_NAME = "plsql-style-checker"


def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")

        # Only check SQL files
        if not filename.endswith(".sql"):
            continue

        lines = content.split("\n")

        for line_number, line in enumerate(lines, start=1):

            # ─────────────────────────────────────────
            # Check 1: No space before comma
            # Bad: name , age
            # Good: name, age
            # ─────────────────────────────────────────
            if re.search(r"\s+,", line):
                issues.append(
                    f"{filename} line {line_number}: "
                    f"space found before comma"
                )

            # ─────────────────────────────────────────
            # Check 2: Space required after comma
            # Bad: name,age
            # Good: name, age
            # ─────────────────────────────────────────
            if re.search(r",[^\s\n\r)]", line):
                issues.append(
                    f"{filename} line {line_number}: "
                    f"missing space after comma"
                )

            # ─────────────────────────────────────────
            # Check 3: Duplicate commas
            # Bad: name,, age
            # ─────────────────────────────────────────
            if ",," in line:
                issues.append(
                    f"{filename} line {line_number}: "
                    f"duplicate commas detected"
                )

            # ─────────────────────────────────────────
            # Check 4: Multiple parameters on same line
            # Bad: p_name IN VARCHAR2, p_age IN NUMBER
            # ─────────────────────────────────────────
            if re.search(r"\bIN\b.*,.*\bIN\b", line, re.IGNORECASE):
                issues.append(
                    f"{filename} line {line_number}: "
                    f"multiple parameters on same line "
                    f"(each parameter must be on its own line)"
                )

            # ─────────────────────────────────────────
            # Check 5: Indentation
            # Must be multiples of 4 spaces
            # ─────────────────────────────────────────
            stripped = line.lstrip(" ")
            spaces = len(line) - len(stripped)

            if spaces > 0 and spaces % 4 != 0:
                issues.append(
                    f"{filename} line {line_number}: "
                    f"wrong indentation ({spaces} spaces) "
                    f"(indentation must be multiples of 4 spaces)"
                )

            # ─────────────────────────────────────────
            # Check 6: BEGIN must be alone
            # Bad: BEGIN SELECT ...
            # Good: BEGIN
            # ─────────────────────────────────────────
            stripped_upper = line.strip().upper()

            if stripped_upper.startswith("BEGIN") and stripped_upper != "BEGIN":
                issues.append(
                    f"{filename} line {line_number}: "
                    f"BEGIN must be on its own line"
                )

        # ─────────────────────────────────────────
        # Check 7: Missing comma between parameters
        # ─────────────────────────────────────────
        for i in range(len(lines) - 1):
            current_line = lines[i].strip()
            next_line = lines[i + 1].strip()

            current_param = re.search(
                r"\b(IN|OUT|IN OUT)\b",
                current_line,
                re.IGNORECASE
            )

            next_param = re.search(
                r"\b(IN|OUT|IN OUT)\b",
                next_line,
                re.IGNORECASE
            )

            if (
                current_param
                and next_param
                and not current_line.endswith(",")
            ):
                issues.append(
                    f"{filename} line {i+1}: "
                    f"missing comma between parameters"
                )

        # ─────────────────────────────────────────
        # Check 8: Trailing comma before ')'
        # ─────────────────────────────────────────
        if re.search(r",\s*\)", content, re.MULTILINE):
            issues.append(
                f"{filename}: trailing comma before closing parenthesis"
            )

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": (
                "✅ PL/SQL style is correct\n"
                "✔ Comma formatting is valid\n"
                "✔ Parameters are properly formatted\n"
                "✔ Indentation is correct\n"
                "✔ BEGIN placement is correct"
            ),
        }

    return {
        "rule": RULE_NAME,
        "passed": False,
        "message": (
            f"❌ Found {len(issues)} style issue(s):\n\n"
            + "\n".join(
                f"{index + 1}. {issue}"
                for index, issue in enumerate(issues)
            )
        ),
    }
