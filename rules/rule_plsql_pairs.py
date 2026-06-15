"""
RULE: PL/SQL Structure Pairs
─────────────────────────────
What it checks: Matching keyword pairs in PL/SQL code

Valid pairs:
  FUNCTION ... must have ... RETURN
  IF ... must have ... END IF
  BEGIN ... must have ... END

To add more pairs: add them to the PAIRS list below
"""

RULE_NAME = "plsql-structure-pairs"

# ─────────────────────────────────────────
# PAIRS LIST
# Format: (starting_keyword, required_ending_keyword)
# ─────────────────────────────────────────
PAIRS = [
    ("FUNCTION", "RETURN"),
    ("IF", "END IF"),
    ("BEGIN", "END"),
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
                    f"{filename}: found '{start_keyword}' but missing '{end_keyword}'"
                )

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": "✅ All structure pairs are correctly matched",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": "❌ Found " + str(len(issues)) + " issue(s):\n" + "\n".join(issues),
        }
