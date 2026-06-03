# How to Add a New Rule

No Python knowledge needed.
Just follow the steps below.
Takes less than 5 minutes. ⏱️

---

## Before you start

You will touch exactly 3 files:

| File | What you do |
|---|---|
| `rules/` folder | Create your new rule file here |
| `runner.py` | Register your rule here |
| `tests/test_rules.py` | Add your tests here |

You do NOT need to touch anything else. ✅

---

## Step 1: Create your rule file

1. Go to the `rules/` folder
2. Create a new file
3. Name it like this: `rule_what_it_checks.py`

Examples of good names:
```
rule_branch_name.py
rule_ticket_number.py
rule_pr_size.py
```

---

## Step 2: Copy this into your new file

Copy everything below and paste it into your new file:

```python
import re

RULE_NAME = "your-rule-name"

PATTERN = re.compile(r"your-pattern-here")

def check(pr: dict) -> dict:
    title = pr.get("title", "")
    if PATTERN.match(title):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{title}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{title}'"}
```

Now change ONLY these 2 things:

**Change 1 — Give your rule a name:**
```
RULE_NAME = "your-rule-name"
           ↑
           Change this to describe your rule
           Example: "ticket-number" or "branch-format"
```

**Change 2 — Pick your pattern:**
```
PATTERN = re.compile(r"your-pattern-here")
                      ↑
                      Copy a pattern from the cheat sheet below
```

---

## Step 3: Register your rule

Open `runner.py`.

Find this section:
```python
# add your rule here ↓
```

Add these 2 lines:

**Line 1 — at the top of the file:**
```python
from rules.rule_YOUR_FILE_NAME import check as rule_YOUR_FILE_NAME
```

**Line 2 — in the RULES list:**
```python
RULES = [
    rule_pr_title,
    rule_YOUR_FILE_NAME,  # ← add this line
]
```

Replace `YOUR_FILE_NAME` with your actual file name.

Example — if your file is `rule_ticket_number.py`:
```python
from rules.rule_ticket_number import check as rule_ticket_number

RULES = [
    rule_pr_title,
    rule_ticket_number,
]
```

---

## Step 4: Add 2 tests

Open `tests/test_rules.py`.

Find the bottom of the file and add these 2 tests:

```python
def test_YOUR_RULE_passes(self):
    result = check(make_pr("paste a good example here"))
    assert result["passed"] is True

def test_YOUR_RULE_fails(self):
    result = check(make_pr("paste a bad example here"))
    assert result["passed"] is False
```

Replace:
- `YOUR_RULE` with your rule name
- `"paste a good example here"` with a title that should pass
- `"paste a bad example here"` with a title that should fail

Example — for ticket number rule:
```python
def test_ticket_number_passes(self):
    result = check(make_pr("feat: LOGIN-123 add login"))
    assert result["passed"] is True

def test_ticket_number_fails(self):
    result = check(make_pr("feat: add login"))
    assert result["passed"] is False
```

---

## Step 5: Run the tests

Open your terminal and type:
```bash
python -m pytest tests/ -v
```

You should see:
```
test_YOUR_RULE_passes   PASSED ✅
test_YOUR_RULE_fails    PASSED ✅
```

If anything shows FAILED — check your pattern. 🔧

---

## Finding your pattern

Answer this question:

**What are you checking?**

### PR Title
| I want the title to... | Copy this pattern |
|---|---|
| Start with feat/fix/docs | `^(feat\|fix\|docs\|chore): .+` |
| Have a ticket number | `[A-Z]+-[0-9]+` |
| Not be empty | `.+` |

### Branch Name
| I want the branch to... | Copy this pattern |
|---|---|
| Start with feat/ or fix/ | `^(feat\|fix\|chore)/` |
| Have no spaces | `^\S+$` |
| Use only lowercase | `^[a-z/\-]+$` |

### Length check
If you want to check length, replace the pattern section with:
```python
if len(title) <= 50:   # change 50 to your limit
    return {"rule": RULE_NAME, "passed": True,  "message": "✅ Length is good"}
else:
    return {"rule": RULE_NAME, "passed": False, "message": "❌ Too long!"}
```

---

## Something not working?

| Problem | Solution |
|---|---|
| Tests failing | Check your pattern matches your example |
| Rule not running | Check you added it to RULES list |
| File not found | Check your file is inside `rules/` folder |
| Pattern not matching | Copy a pattern from the cheat sheet above |

---

## How to disable a rule

Open `runner.py` and put a `#` in front of the rule:

```python
RULES = [
    rule_pr_title,
    # rule_ticket_number,  ← disabled
]
```

---

## Full worked example

Here is a complete example from start to finish.

**Goal:** Check that PR title has a ticket number like `LOGIN-123`

**Step 1** — Create file: `rules/rule_ticket_number.py`

**Step 2** — Paste and fill in:
```python
import re

RULE_NAME = "ticket-number"

PATTERN = re.compile(r"[A-Z]+-[0-9]+")

def check(pr: dict) -> dict:
    title = pr.get("title", "")
    if PATTERN.match(title):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{title}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{title}'"}
```

**Step 3** — Add to `runner.py`:
```python
from rules.rule_ticket_number import check as rule_ticket_number

RULES = [
    rule_pr_title,
    rule_ticket_number,
]
```

**Step 4** — Add tests to `test_rules.py`:
```python
def test_ticket_number_passes(self):
    result = check(make_pr("feat: LOGIN-123 add login"))
    assert result["passed"] is True

def test_ticket_number_fails(self):
    result = check(make_pr("feat: add login"))
    assert result["passed"] is False
```

**Step 5** — Run tests:
```bash
python -m pytest tests/ -v
```

Done! ✅