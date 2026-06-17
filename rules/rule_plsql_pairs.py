"""
RULE: PL/SQL Structure Pairs
─────────────────────────────
What it checks: Matching keyword pairs in PL/SQL code

Valid pairs:
  FUNCTION ... must have ... RETURN
  IF ... must have ... END IF
  LOOP ... must have ... END LOOP
  CASE ... must have ... END CASE

To add more pairs: add them to the PAIRS list below
"""

RULE_NAME = "plsql-structure-pairs"

PAIRS = [
    ("FUNCTION", "RETURN"),
    ("IF",       "END IF"),
    ("LOOP",     "END LOOP"),
    ("CASE",     "END CASE"),
]


def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")
        content_upper = content.upper()

        for start_keyword, end_keyword in PAIRS:
            has_start = start_keyword in content_upper
            has_end = end_keyword in content_upper

            if has_start and not has_end:
                issues.append(
                    f"  File: {filename}\n"
                    f"  Found: '{start_keyword}' block\n"
                    f"  Missing: '{end_keyword}'\n"
                    f"  Fix: Every '{start_keyword}' block must end with '{end_keyword}'"
                )

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": "✅ All PL/SQL structure pairs are correctly matched",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": (
                f"❌ PL/SQL Structure Pairs — Found {len(issues)} issue(s):\n\n" +
                "\n\n".join(issues)
            ),
        }
