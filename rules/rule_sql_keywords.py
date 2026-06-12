"""
RULE: SQL Keyword Case
───────────────────────
What it checks: SQL keywords must be UPPERCASE
Valid example:  SELECT name FROM users          ✅
Invalid example: select name from users         ❌

To add more keywords: just add them to the KEYWORDS list below
"""

import re

RULE_NAME = "sql-keyword-case"

# ─────────────────────────────────────────
# KEYWORDS LIST
# Add or remove keywords here. No code knowledge needed!
# ─────────────────────────────────────────
KEYWORDS = [
    "SELECT",
    "FROM",
    "WHERE",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "ALTER",
    "DROP",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "OUTER",
    "ON",
    "AND",
    "OR",
    "NOT",
    "IN",
    "AS",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "LIMIT",
    "DISTINCT",
    "COUNT",
    "SUM",
    "AVG",
    "MAX",
    "MIN",
    "NULL",
    "IS",
    "LIKE",
    "BETWEEN",
    "UNION",
    "EXISTS",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
    "DEFAULT",
    "UNIQUE",
    "INDEX",
]


def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")

        lines = content.split("\n")
        for line_number, line in enumerate(lines, start=1):
            for keyword in KEYWORDS:
                # check if lowercase version of keyword exists
                pattern = r"\b" + keyword.lower() + r"\b"
                if re.search(pattern, line):
                    issues.append(
                        f"{filename} line {line_number}: "
                        f"'{keyword.lower()}' should be '{keyword}'"
                    )

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": "✅ All SQL keywords are correctly UPPERCASE",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": "❌ Found " + str(len(issues)) + " issue(s):\n" + "\n".join(issues),
        }
