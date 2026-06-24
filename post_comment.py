"""
Posts PR rule check results as a comment on the PR.
Uses GitHub API to create a sticky comment.
"""

import json
import os
import sys
import urllib.request


def format_comment(results: dict, pr_payload: dict) -> str:
    pr_title  = pr_payload.get("title", "")
    pr_number = pr_payload.get("number", "")
    pr_author = pr_payload.get("author", "")
    pr_branch = pr_payload.get("head", "")

    lines = []
    lines.append("## 🤖 PR Rule Engine Results")
    lines.append("")
    lines.append(f"**PR #{pr_number}:** {pr_title}")
    lines.append(f"**Branch:** `{pr_branch}` | **Author:** `{pr_author}`")
    lines.append("")
    lines.append("| Rule | Status | Message |")
    lines.append("|------|--------|---------|")

    for result in results.get("results", []):
        rule    = result.get("rule", "")
        passed  = result.get("passed", False)
        message = result.get("message", "").replace("\n", " ")[:100]
        status  = "✅ PASS" if passed else "❌ FAIL"
        lines.append(f"| `{rule}` | {status} | {message} |")

    lines.append("")

    overall      = results.get("passed", False)
    total        = len(results.get("results", []))
    passed_count = sum(1 for r in results.get("results", []) if r.get("passed"))
    failed_count = total - passed_count

    if overall:
        lines.append(f"**Overall: ✅ All {total} rules passed!**")
    else:
        lines.append(f"**Overall: ❌ {failed_count} of {total} rules failed**")

    lines.append("")
    lines.append("---")
    lines.append("*Posted by PR Rule Engine Bot*")

    return "\n".join(lines)


def post_comment(comment: str, pr_number: str, repo: str, token: str):
    url  = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    data = json.dumps({"body": comment}).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json",
        },
        method="POST"
    )

    with urllib.request.urlopen(req) as response:
        if response.status == 201:
            print("✅ Comment posted successfully!")
        else:
            print(f"❌ Failed to post comment: {response.status}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python post_comment.py <pr_payload.json>")
        sys.exit(1)

    with open(sys.argv[1]) as f:
        pr_payload = json.load(f)

    with open("pr_results.json") as f:
        results = json.load(f)

    token     = os.environ.get("GITHUB_TOKEN", "")
    repo      = os.environ.get("GITHUB_REPOSITORY", "")
    pr_number = pr_payload.get("number", "")

    if not token:
        print("❌ GITHUB_TOKEN not found")
        sys.exit(1)

    comment = format_comment(results, pr_payload)
    post_comment(comment, pr_number, repo, token)


if __name__ == "__main__":
    main()
