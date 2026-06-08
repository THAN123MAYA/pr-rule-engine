# PR Rule Engine — Graduation PR

## What it does

This PR delivers a working PR rule engine with one rule in production.

Every time a developer opens a Pull Request, the engine automatically 
checks the PR title and returns a pass or fail result.

**Rule 1: PR Title Format**
- PR title must follow this format: `type: description`
- Valid types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `ci`
- Valid example: `feat: add login page` ✅
- Invalid example: `added login page` ❌

**How it works:**
```
Developer opens PR
       ↓
GitHub Actions triggers automatically
       ↓
runner.py runs all registered rules
       ↓
rule_pr_title.py checks the title
       ↓
Returns pass ✅ or fail ❌ on the PR
```

---

## What it doesn't do

- Does not check branch names
- Does not check commit messages
- Does not check PR size
- Does not check actual code files
- Does not post a comment on the PR
- Does not suggest fixes to the developer

All of these can be added as new rules using the guide in `review-rules.md`.

---

## How to extend

Adding a new rule takes 5 minutes.
Full guide is in `review-rules.md`.

In short:
1. Create a file in `rules/` folder
2. Copy the template from `review-rules.md`
3. Change 2 things — rule name and pattern
4. Add 2 lines to `runner.py`
5. Add 2 tests to `test_rules.py`
6. Push to GitHub and open a PR

No Python knowledge needed. ✅

---

## How to disable a rule

Open `runner.py` and put a `#` in front of the rule:

```python
RULES = [
    rule_pr_title,
    # rule_ticket_number,  ← disabled
]
```

No other files need to change.

---

## Files in this PR

| File | What it does |
|---|---|
| `runner.py` | Runs all rules, extensible registry |
| `rules/rule_pr_title.py` | Rule 1 — checks PR title format |
| `tests/test_rules.py` | 16 tests covering pass and fail cases |
| `.github/workflows/pr-rules.yml` | Triggers rule engine on every PR |
| `review-rules.md` | Guide for adding new rules |

---

## Extensibility test

> "Would a Phoenix dev find this easy to extend?"

Yes. Here is why:
- Adding a rule = 1 new file + 2 lines in `runner.py`
- The guide needs no Python knowledge
- Every rule file has a header explaining what it does
- The runner has comments showing exactly where to add rules
- Disabling a rule = one `#` character
- Pattern cheat sheet covers most common situations
- Fallback options available when pattern not in cheat sheet

---

## How to test

**On GitHub:**
1. Open any PR with title `feat: add something` → sees ✅
2. Open any PR with title `fixed something` → sees ❌

**Locally:**
```bash
python -m pytest tests/ -v
```
All 16 tests should pass. ✅