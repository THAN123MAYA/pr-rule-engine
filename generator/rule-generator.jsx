import { useState, useRef, useEffect } from "react";

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
\`\`\`
import re

RULE_NAME = "your-rule-name"
PATTERN = re.compile(r"your-pattern-here")

def check(pr: dict) -> dict:
    value = pr.get("title", "")  # change field: title, head, base, author
    if PATTERN.match(value):
        return {"rule": RULE_NAME, "passed": True,  "message": f"✅ Passed: '{value}'"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Failed: '{value}'"}
\`\`\`
Fields: title=PR title, head=branch name, base=target branch, author=PR author

For file content checks:
\`\`\`
"""
RULE: Rule Name
What it checks: ...
Valid: ...   ✅
Invalid: ... ❌
"""
import re  # only if needed

RULE_NAME = "your-rule-name"
PATTERN = re.compile(r"...")  # only if needed

def check(pr: dict) -> dict:
    files = pr.get("files", [])
    issues = []
    for file in files:
        filename = file.get("filename", "")
        content = file.get("content", "")
        # your logic here
        if CONDITION:
            issues.append(f"{filename}: describe problem")
    if not issues:
        return {"rule": RULE_NAME, "passed": True, "message": "✅ All files passed this check"}
    else:
        return {"rule": RULE_NAME, "passed": False, "message": f"❌ Found {len(issues)} issue(s):\\n\\n" + "\\n\\n".join(issues)}
\`\`\`

Config entry format:
\`\`\`yaml
- name: rule-name
  check: check_type   # e.g. max_lines, not_contains, starts_with, pattern_match
  value: ...          # depends on check type
\`\`\`

Generate complete, correct, ready-to-use Python code. Use regex when needed. Handle edge cases. For file rules, check file extensions if relevant.`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        background: "none",
        border: "0.5px solid var(--border-strong)",
        borderRadius: "var(--radius)",
        color: copied ? "var(--text-success)" : "var(--text-secondary)",
        cursor: "pointer",
        fontSize: 12,
        padding: "3px 10px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "color 0.2s",
      }}
    >
      <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ label, code, icon }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface-0)",
        borderRadius: "var(--radius) var(--radius) 0 0",
        border: "0.5px solid var(--border)",
        borderBottom: "none",
        padding: "6px 12px",
      }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
          {label}
        </span>
        <CopyButton text={code} />
      </div>
      <pre style={{
        margin: 0,
        padding: "12px 14px",
        background: "var(--surface-0)",
        border: "0.5px solid var(--border)",
        borderRadius: "0 0 var(--radius) var(--radius)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        overflowX: "auto",
        color: "var(--text-primary)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {code}
      </pre>
    </div>
  );
}

function AIMessage({ msg }) {
  if (msg.error) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "var(--bg-danger)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="ti ti-robot" style={{ fontSize: 15, color: "var(--text-danger)" }} aria-hidden="true" />
        </div>
        <div style={{
          background: "var(--bg-danger)",
          border: "0.5px solid var(--border-danger)",
          borderRadius: "0 12px 12px 12px",
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--text-danger)",
          maxWidth: "85%",
        }}>
          {msg.error}
        </div>
      </div>
    );
  }

  const d = msg.data;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "var(--bg-accent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <i className="ti ti-robot" style={{ fontSize: 15, color: "var(--text-accent)" }} aria-hidden="true" />
      </div>
      <div style={{ maxWidth: "90%", minWidth: 0 }}>
        <div style={{
          background: "var(--surface-1)",
          border: "0.5px solid var(--border)",
          borderRadius: "0 12px 12px 12px",
          padding: "12px 14px",
          fontSize: 14,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <i className="ti ti-check" style={{ fontSize: 14, color: "var(--text-success)" }} aria-hidden="true" />
            <span style={{ fontWeight: 500 }}>{d.rule_name}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.filename}</span>
          </div>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>{d.explanation}</p>
        </div>
        <CodeBlock label={d.filename} code={d.python_code} icon="ti-brand-python" />
        <CodeBlock label="rules-config.yml entry" code={d.config_entry} icon="ti-file-code" />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0", paddingLeft: 2 }}>
          Copy <strong style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{d.filename}</strong> → paste into your <code style={{ fontFamily: "var(--font-mono)", background: "var(--surface-0)", padding: "1px 5px", borderRadius: 4 }}>rules/</code> folder, then add the config entry to <code style={{ fontFamily: "var(--font-mono)", background: "var(--surface-0)", padding: "1px 5px", borderRadius: 4 }}>rules-config.yml</code>
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "var(--bg-accent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <i className="ti ti-robot" style={{ fontSize: 15, color: "var(--text-accent)" }} aria-hidden="true" />
      </div>
      <div style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "0 12px 12px 12px",
        padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--text-muted)",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "PR title must start with feat, fix, docs, or chore",
  "No file should have more than 300 lines",
  "Every SQL file must start with an author comment",
  "Branch name should only use lowercase letters and hyphens",
  "No file should contain console.log or print() statements",
  "PR author cannot merge into main directly",
];

export default function RuleGenerator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const generate = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: text.trim() }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setMessages(prev => [...prev, { role: "ai", data: parsed }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", error: "Something went wrong generating that rule. Try describing it differently." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .suggestion-btn:hover {
          background: var(--surface-1) !important;
          border-color: var(--border-accent) !important;
          color: var(--text-accent) !important;
        }
      `}</style>

      <h2 className="sr-only">Rule Generator — describe a rule in plain English to get a ready-to-use Python rule file</h2>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: 720, fontFamily: "var(--font-sans)" }}>

        <div style={{
          padding: "14px 18px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--bg-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-shield-check" style={{ fontSize: 16, color: "var(--text-accent)" }} aria-hidden="true" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>Rule Generator</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Describe any rule in plain English</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 18 }}>

          {isEmpty && (
            <div style={{ margin: "auto 0", paddingTop: 20 }}>
              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
                Describe your rule in plain English and get a ready-to-use Python file.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-btn"
                    onClick={() => generate(s)}
                    style={{
                      background: "none",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: 13,
                      padding: "7px 13px",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "var(--fill-accent)",
                    color: "var(--on-accent)",
                    borderRadius: "12px 12px 0 12px",
                    padding: "10px 14px",
                    fontSize: 14,
                    maxWidth: "80%",
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <AIMessage msg={msg} />
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 14px", borderTop: "0.5px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your rule... (e.g. 'No Python file should be longer than 200 lines')"
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                padding: "10px 12px",
                borderRadius: "var(--radius)",
                border: "0.5px solid var(--border-strong)",
                background: "var(--surface-1)",
                color: "var(--text-primary)",
                lineHeight: 1.5,
                outline: "none",
              }}
            />
            <button
              onClick={() => generate(input)}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? "var(--fill-accent)" : "var(--surface-1)",
                color: input.trim() && !loading ? "var(--on-accent)" : "var(--text-muted)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                padding: "0 16px",
                height: 42,
                fontSize: 14,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <i className="ti ti-arrow-up" aria-hidden="true" />
              Generate
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)", paddingLeft: 2 }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
