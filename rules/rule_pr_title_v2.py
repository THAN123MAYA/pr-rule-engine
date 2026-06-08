import re

RULE_NAME = "pr-title-format"

PATTERN = re.compile(r"^(feat|fix|docs|chore|refactor|test|style|ci)(\(.+\))?: .+",
    re.IGNORECASE,
)

def check(pr: dict) -> dict:
    title = pr.get("title", "")
    if PATTERN.match(title):
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": f"✅ PR title is valid: '{title}'",
        }
    else:
            return {
            "rule": RULE_NAME,
            "passed": False,
            "message": (
                f"❌ '{title}' is not a valid PR title. "
                f"Format must be: 'type: description' "
                f"Valid types: feat, fix, docs, chore, refactor, test, style, ci "
                f"Example: 'feat: add login page'"
            ),
        }
    
