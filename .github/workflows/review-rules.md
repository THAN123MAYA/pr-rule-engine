# PR Rule Engine — How to Add a Rule

This guide shows exactly what a developer needs to do to add a new rule.
Adding a rule takes about 5 minutes.

---

## What is a rule?

A rule is a single check that runs against every Pull Request.
Each rule looks at the PR data (title, branch name, author etc.)
and returns a simple pass or fail result.

---

## Step 1: Create a new file in /rules

Name it clearly. Examples:
- `rules/rule_branch_name.py`
- `rules/rule_ticket_number.py`
- `rules/rule_pr_size.py`

---

## Step 2: Copy this template into your new file

```python
import re

RULE_NAME = "your-rule-name"

PATTERN = re.compile(
    r"your-pattern-here",
)

def check(pr: dict) -> dict:
    value = pr.get("title", "")

    if PATTERN.match(value):
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": f"✅ Passed: '{value}'",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": f"❌ Failed: '{value}' did not match expected format.",
        }
```

---

## Step 3: Register the rule in runner.py

Open `runner.py` and do 2 things:

**Add the import at the top:**
```python
from rules.rule_your_name import check as rule_your_name
```

**Add it to the RULES list:**
```python
RULES = [
    rule_pr_title,
    rule_your_name,
]
```

That's it. The runner picks it up automatically. ✅

---

## Step 4: Write tests for your rule

Open `tests/test_rules.py` and add:

```python
def test_your_rule_passes(self):
    result = check(make_pr("your valid example"))
    assert result["passed"] is True

def test_your_rule_fails(self):
    result = check(make_pr("your invalid example"))
    assert result["passed"] is False
```

Always test BOTH pass and fail cases.

---

## Worked Example — Ticket Number Rule

**What it checks:** PR title must contain a ticket number like `LOGIN-123`

**Valid:** `feat: LOGIN-123 add login page` ✅

**Invalid:** `feat: add login page` ❌

### The rule file: `rules/rule_ticket_number.py`

```python
import re

RULE_NAME = "pr-ticket-number"

PATTERN = re.compile(
    r"^(feat|fix|docs|chore|refactor|test|style|ci)(\(.+\))?: [A-Z]+-[0-9]+ .+",
)

def check(pr: dict) -> dict:
    title = pr.get("title", "")

    if PATTERN.match(title):
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": f"✅ PR title has a valid ticket number: '{title}'",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": (
                f"❌ PR title '{title}' is missing a ticket number. "
                f"Expected: 'feat: LOGIN-123 description'"
            ),
        }
```

---

## PR data available to rules

| Field | Meaning | Example |
|---|---|---|
| `pr["title"]` | PR title | `feat: add login` |
| `pr["number"]` | PR number | `42` |
| `pr["author"]` | Who opened it | `john-doe` |
| `pr["base"]` | Target branch | `main` |
| `pr["head"]` | Source branch | `feat/add-login` |

---

## How to disable a rule

Simply remove it from the RULES list in `runner.py`:

```python
RULES = [
    rule_pr_title,
    # rule_ticket_number,   ← commented out = disabled
]
```

No other files need to change.