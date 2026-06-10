import re  # re = regex library, used for pattern matching

RULE_NAME = "branch_name"

PATTERN = re.compile(r"^(feat|fix|chore)/")  # ← paste your pattern from Step 2 here

def check(pr: dict) -> dict:
    title = pr.get("head", "")
    if PATTERN.match(title):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{title}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{title}'"}
