export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rule } = req.body;

  if (!rule) {
    return res.status(400).json({ error: "No rule description provided" });
  }

  const SYSTEM_PROMPT = `You are a PR rule generator for a GitHub Actions rule engine. When someone describes a rule in plain English, generate a complete working rule file.

Always respond ONLY with a valid JSON object (no markdown, no backticks, no explanation outside JSON):
{
  "explanation": "one sentence describing what this rule checks",
  "filename": "rule_snake_case_name.py",
  "rule_name": "kebab-case-name",
  "python_code": "complete python file content as a string",
  "config_entry": "yaml snippet showing how this rule appears in rules-config.yml"
}

RULE TEMPLATES:

For PR metadata checks (title, branch, author, target branch):
import re
RULE_NAME = "your-rule-name"
PATTERN = re.compile(r"your-pattern-here")
def check(pr: dict) -> dict:
    value = pr.get("title", "")
    if PATTERN.match(value):
        return {"rule": RULE_NAME, "passed": True, "message": f"Passed: '{value}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"Failed: '{value}'"}

Fields: title=PR title, head=branch name, base=target branch, author=PR author

For file content checks:
import re  # only if needed
RULE_NAME = "your-rule-name"
def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []
    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")
        if CONDITION:
            issues.append(f"{filename}: describe problem")
    if not issues:
        return {"rule": RULE_NAME, "passed": True, "message": "All files passed this check"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"Found {len(issues)} issue(s):\\n\\n" + "\\n\\n".join(issues)}

Config entry format:
- name: rule-name
  check: check_type
  value: ...

Generate complete, correct, ready-to-use Python code. Use regex when needed. Handle edge cases.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: rule }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.map((b) => b.text || "").join("") || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate rule. Try describing it differently." });
  }
}
