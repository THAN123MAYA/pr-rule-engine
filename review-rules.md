# How to Add a New Rule

No Python knowledge needed.
Just follow the steps below.
Takes less than 5 minutes. ⏱️

---

## ⚠️ Common mistakes to avoid

These are the most common things that go wrong. Check these first!

| Mistake | How to avoid |
|---|---|
| Wrong branch | Always check which branch you're on before making changes |
| Wrong folder | Rule files must go inside `rules/` folder — not anywhere else |
| Wrong file | Double check you opened the right file before editing |
| Wrong indentation | Every line inside a function needs 1 tab before it |
| Wrong field | Check the field table in Step 3 — title, head, base, author |
| Wrong template | Two templates exist — check Step 3 vs Step 3B below |

> 💡 **Quick checklist before you start:**
> - Am I on the right branch? ✅
> - Am I inside the `rules/` folder? ✅
> - Did I use the right field name? ✅
> - Did I indent with Tab? ✅
> - Am I using the right template (3 or 3B)? ✅

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

## Which kind of rule are you building?

| I am checking... | Use |
|---|---|
| PR title, branch name, author, target branch (one single value) | Step 3 template |
| Actual code inside files — file size, keyword case, comments | Step 3B template |

---

## Step 1: Create your rule file

1. Go to the `rules/` folder
2. Create a new file
3. Name it like this: `rule_what_it_checks.py`

Examples of good names:
```
rule_branch_name.py
rule_ticket_number.py
rule_file_size.py
```

---

## Step 2: Find your pattern (only needed for Step 3 template)

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

### File-level checks
| I want to check... | Copy this pattern |
|---|---|
| File starts with author comment | `^--\s*AUTHOR:\s*.+` |

### Length check
If you want to check length, replace the pattern section with:
```python
if len(title) <= 50:   # change 50 to your limit
    return {"rule": RULE_NAME, "passed": True,  "message": "✅ Length is good"}
else:
    return {"rule": RULE_NAME, "passed": False, "message": "❌ Too long!"}
```

### Logic-based checks (no pattern needed!)

Not every rule needs a regex pattern. Some rules check numbers or conditions instead.

| I want to check... | Use this logic instead of a pattern |
|---|---|
| File line count | `len(content.split("\n")) > 50` |
| File is not empty | `len(content.strip()) == 0` |
| Number of files changed | `len(files) > 10` |

### Can't find your pattern?

Try in this order:
1. **Ask a teammate** — someone may have done it before
2. **Search Google** — type: `python regex check if string starts with "your requirement"`
3. **Test your pattern** — paste it at https://regex101.com

---

## Step 3: Copy this template — single value checks

Use this template when checking ONE value: PR title, branch name, author, or target branch.

```python
import re  # re = regex library, used for pattern matching

RULE_NAME = "your-rule-name"

PATTERN = re.compile(r"your-pattern-here")  # ← paste your pattern from Step 2 here

def check(pr: dict) -> dict:
    value = pr.get("title", "")  # ← change "title" based on what you're checking
    if PATTERN.match(value):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{value}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{value}'"}
```

**Change ONLY these 3 things:**

| What to change | Where | Example |
|---|---|---|
| `"your-rule-name"` | Line 3 | `"branch-name"` |
| `"your-pattern-here"` | Line 5 | `^(feat\|fix)/` |
| `"title"` | Line 8 | See table below |

**What to put instead of "title":**

| I am checking... | Change "title" to... |
|---|---|
| PR title | `"title"` ← keep as is |
| Branch name | `"head"` |
| Target branch | `"base"` |
| PR author | `"author"` |

---

## Step 3B: Copy this template — file-checking rules

Use this template when checking the ACTUAL CODE FILES changed in the PR — like file size, keyword case, or comment headers.

```python
"""
RULE: Your Rule Name
─────────────────────
What it checks: describe what this checks
Valid example:   ...    ✅
Invalid example: ...    ❌
"""

RULE_NAME = "your-rule-name"


def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")

        # ↓ YOUR CHECK GOES HERE ↓
        # Example: check something about content or filename
        # if SOMETHING_WRONG:
        #     issues.append(f"{filename}: describe the problem")

    if not issues:
        return {
            "rule": RULE_NAME,
            "passed": True,
            "message": "✅ All files passed this check",
        }
    else:
        return {
            "rule": RULE_NAME,
            "passed": False,
            "message": (
                f"❌ Found {len(issues)} issue(s):\n\n" + "\n\n".join(issues)
            ),
        }
```

**Change ONLY these 2 things:**

| What to change | Where |
|---|---|
| `"your-rule-name"` | Top of file |
| The check logic inside the `for` loop | Replace the commented placeholder |
### Copy this template for file-checking rules:

⚠️ Note: This template has no PATTERN line by default, because some 
file-checks need a pattern and some don't (see Step 2 above).

- If you need a PATTERN → add `import re` and `PATTERN = re.compile(...)` 
  at the top, then use `PATTERN.match(...)` inside the loop (see the 
  Author Comment Header example below)
- If you DON'T need a PATTERN → just write plain Python logic inside 
  the loop (see the File Size Limit example below)

### Worked example — File Size Limit

```python
RULE_NAME = "file-size-limit"

def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []

    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")
        line_count = len(content.split("\n"))

        if line_count > 50:
            issues.append(f"{filename}: {line_count} lines (limit is 50)")

    if not issues:
        return {"rule": RULE_NAME, "passed": True, "message": "✅ All files within limit"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": "❌ " + "\n\n".join(issues)}
```

### Worked example — Author Comment Header

```python
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
            issues.append(f"{filename}: missing '-- AUTHOR: name' as first line")

    if not issues:
        return {"rule": RULE_NAME, "passed": True, "message": "✅ All SQL files have an author comment"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": "❌ " + "\n\n".join(issues)}
```

---

## Step 4: Register your rule

Open `runner.py` and find this section:
```python
# add your rule here ↓
```

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

Example — if your file is `rule_file_size.py`:
```python
from rules.rule_file_size import check as rule_file_size

RULES = [
    rule_pr_title,
    rule_file_size,
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

**Push your code to GitHub and open a Pull Request.**

GitHub automatically runs all tests and shows:
```
✅ All checks passed   → your rule works!
❌ Some checks failed  → check your pattern
```

That's it! No installation needed. 😊

> **Only if you want to test locally first:**
> Install Python from https://python.org/downloads
> Then run: `python -m pytest tests/ -v`

---

## Something not working?

| Problem | Solution |
|---|---|
| Tests failing | Check your pattern matches your example |
| Rule not running | Check you added it to RULES list |
| File not found | Check your file is inside `rules/` folder |
| Pattern not matching | Copy a pattern from Step 2 above |
| GitHub Actions not triggering | Check `.github/workflows/pr-rules.yml` exists |
| Rule always passes/fails unexpectedly | Check you used the right template (3 vs 3B) |

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

## Full worked example — Step 3 template

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

---

## Check these files exist!

Your repo must have ALL of these files to work:

| File | Location | What happens if missing |
|---|---|---|
| `runner.py` | root folder | Rules never run |
| `__init__.py` | inside `rules/` folder | Python can't find rules |
| `pr-rules.yml` | `.github/workflows/` folder | GitHub Actions never triggers |
| `tests/test_rules.py` | inside `tests/` folder | Tests can't run |
| `build_payload.py` | root folder | File-checking rules (Step 3B) get no file content |

Your repo must look like this:

```
your-repo/
├── 📄 runner.py                    ← must exist!
├── 📄 build_payload.py             ← must exist! (needed for Step 3B rules)
├── 📄 review-rules.md              ← this guide
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 pr-rules.yml         ← must exist!
├── 📁 rules/
│   ├── 📄 __init__.py              ← must exist!
│   └── 📄 rule_pr_title.py         ← at least one rule
└── 📁 tests/
    └── 📄 test_rules.py            ← must exist!
```

If any file is missing → copy it from the section below! ✅

---

## Setting up a brand new repo from scratch

If you're starting fresh, create all these files first.
Then follow the guide above to add your own rules.

---

### File 1: `runner.py` (copy exactly)

```python
"""
PR Rule Engine — Runner
───────────────────────
HOW TO ADD A NEW RULE:
1. Create a file in /rules folder
2. Import it below
3. Add it to the RULES list
That's it! ✅
"""

import json
import sys
from rules.rule_pr_title import check as rule_pr_title

# ─────────────────────────────────────────
# RULE REGISTRY
# Add new rules here ↓
# ─────────────────────────────────────────
RULES = [
    rule_pr_title,
]


def run_all_rules(pr: dict) -> dict:
    results = []
    for rule_fn in RULES:
        result = rule_fn(pr)
        results.append(result)
    overall_passed = all(r["passed"] for r in results)
    return {
        "passed": overall_passed,
        "results": results,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python runner.py <pr_payload.json>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        pr_payload = json.load(f)
    output = run_all_rules(pr_payload)
    print(json.dumps(output, indent=2))
    sys.exit(0 if output["passed"] else 1)
```

---

### File 2: `rules/__init__.py`

Leave this file completely empty. Just create it! ✅

---

### File 3: `build_payload.py` (copy exactly — needed for file-checking rules)

```python
"""
Builds the PR payload including file contents.
This runs inside GitHub Actions before the rule engine.
"""

import sys
import json
import os


def main():
    files_string = sys.argv[1]
    filenames = [f for f in files_string.split(",") if f]

    files_data = []
    for filename in filenames:
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            files_data.append({
                "filename": filename,
                "content": content,
            })

    payload = {
        "title": os.environ.get("PR_TITLE", ""),
        "number": os.environ.get("PR_NUMBER", ""),
        "author": os.environ.get("PR_AUTHOR", ""),
        "base": os.environ.get("PR_BASE", ""),
        "head": os.environ.get("PR_HEAD", ""),
        "files": files_data,
    }

    with open("pr_payload.json", "w") as f:
        json.dump(payload, f, indent=2)


if __name__ == "__main__":
    main()
```

---

### File 4: `.github/workflows/pr-rules.yml` (copy exactly)

```yaml
name: PR Rule Engine

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  run-rules:
    name: Run PR Rules
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Get changed files
        id: changed-files
        run: |
          git fetch origin ${{ github.event.pull_request.base.ref }}
          echo "files=$(git diff --name-only origin/${{ github.event.pull_request.base.ref }}...HEAD | tr '\n' ',')" >> $GITHUB_OUTPUT

      - name: Build PR payload
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          PR_AUTHOR: ${{ github.event.pull_request.user.login }}
          PR_BASE: ${{ github.event.pull_request.base.ref }}
          PR_HEAD: ${{ github.event.pull_request.head.ref }}
        run: |
          python build_payload.py "${{ steps.changed-files.outputs.files }}"

      - name: Run rule engine
        run: python runner.py pr_payload.json
```

---

### File 5: `tests/test_rules.py` (copy exactly)

```python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from rules.rule_pr_title import check
from runner import run_all_rules


def make_pr(title):
    return {"title": title, "number": 1, "author": "test-user"}


class TestPRTitleRule:

    def test_feat_title(self):
        result = check(make_pr("feat: add login page"))
        assert result["passed"] is True

    def test_fix_title(self):
        result = check(make_pr("fix: resolve null pointer"))
        assert result["passed"] is True

    def test_no_type_prefix(self):
        result = check(make_pr("Added login page"))
        assert result["passed"] is False

    def test_wip_title(self):
        result = check(make_pr("WIP"))
        assert result["passed"] is False

    def test_empty_title(self):
        result = check(make_pr(""))
        assert result["passed"] is False


class TestRunner:

    def test_runner_passes_valid_pr(self):
        pr = make_pr("feat: wire rule engine into workflow")
        output = run_all_rules(pr)
        assert output["passed"] is True

    def test_runner_fails_invalid_pr(self):
        pr = make_pr("fixed the bug")
        output = run_all_rules(pr)
        assert output["passed"] is False
```

---

### After creating all files:

1. Push everything to GitHub
2. Open a PR
3. Watch GitHub Actions trigger automatically! ✅

Then follow the guide above to add your own rules. 😊
