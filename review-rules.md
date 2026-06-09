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

## Step 2: Find your pattern

What are you checking?

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

### Can't find your pattern?

Try in this order:

1. **Ask a teammate** — someone may have done it before
2. **Search Google** — type: `python regex check if string starts with "your requirement"`
3. **Test your pattern** — paste it at https://regex101.com — shows instantly if it works!

---

## Step 3: Copy this into your new file

Copy everything below and paste it into your new file:

```python
import re  # re = regex library, used for pattern matching

RULE_NAME = "your-rule-name"

PATTERN = re.compile(r"your-pattern-here")  # ← paste your pattern from Step 2 here

def check(pr: dict) -> dict:
    title = pr.get("title", "")
    if PATTERN.match(title):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{title}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{title}'"}
```

Change ONLY these 2 things:

**Change 1 — Give your rule a name:**
```
RULE_NAME = "your-rule-name"
           ↑
           Change this to describe your rule
           Example: "ticket-number" or "branch-format"
```

**Change 2 — Paste your pattern from Step 2:**
```
PATTERN = re.compile(r"your-pattern-here")
                      ↑
                      Paste your pattern here
```

---

## Step 4: Register your rule

Open `runner.py` and find this section:
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

## Step 5: Add 2 tests

Open `tests/test_rules.py` and add these 2 tests at the bottom:

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

## Step 6: Check your tests

**Option 1 — On GitHub (no setup needed):**
1. Push your changes to GitHub
2. Open a Pull Request
3. GitHub Actions runs tests automatically
4. See ✅ or ❌ on your PR

**Option 2 — On your computer:**
```bash
python -m pytest tests/ -v
```

You should see:
```
test_YOUR_RULE_passes   PASSED ✅
test_YOUR_RULE_fails    PASSED ✅
```

---

## Something not working?

| Problem | Solution |
|---|---|
| Tests failing | Check your pattern matches your example |
| Rule not running | Check you added it to RULES list |
| File not found | Check your file is inside `rules/` folder |
| Pattern not matching | Copy a pattern from Step 2 above |

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

**Goal:** Check that PR title has a ticket number like `LOGIN-123`

**Step 1** — Create file: `rules/rule_ticket_number.py`

**Step 2** — Find pattern: `[A-Z]+-[0-9]+` (from cheat sheet above)

**Step 3** — Paste and fill in:
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

**Step 4** — Add to `runner.py`:
```python
from rules.rule_ticket_number import check as rule_ticket_number

RULES = [
    rule_pr_title,
    rule_ticket_number,
]
```

**Step 5** — Add tests:
```python
def test_ticket_number_passes(self):
    result = check(make_pr("feat: LOGIN-123 add login"))
    assert result["passed"] is True

def test_ticket_number_fails(self):
    result = check(make_pr("feat: add login"))
    assert result["passed"] is False
```

**Step 6** — Push to GitHub and open a PR. Watch GitHub Actions run! ✅
