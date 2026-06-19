"""
RULE: Author Comment Header
─────────────────────────────
What it checks: Every SQL file must start with an author comment
Valid example:   -- AUTHOR: John Doe              ✅
Invalid example: (no comment at the top)           ❌

Format required: -- AUTHOR: <name>
"""

import re

RULE_NAME = "author-comment-header"

PATTERN = re.compile(r"^--\s*AUTHOR:\s*.+", re.IGNORECASE)


def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")

        if not filename.endswith(".sql"):
            continue

        first_line = content.split("\n")[0] if content else ""

        if not PATTERN.match(first_line):
            issues.append(
                f"  File: {filename}\n"
                f"  Found: '{first_line.strip()}'\n"
                f"  Fix: Add '-- AUTHOR: your name' as the very first line"
            )

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": "✅ All SQL files have an author comment",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": (
                f"❌ Author Comment — Found {len(issues)} issue(s):\n\n" +
                "\n\n".join(issues)
            ),
        }
