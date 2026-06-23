"""
Log PR rule check results to a CSV file.
This runs after the rule engine and appends results to pr_check_log.csv
"""

import json
import csv
import os
import sys
from datetime import datetime


def main():
    # Read the PR payload
    if len(sys.argv) < 2:
        print("Usage: python log_results.py <pr_payload.json>")
        sys.exit(1)

    with open(sys.argv[1]) as f:
        pr_payload = json.load(f)

    # Read the rule engine results
    results_file = "pr_results.json"
    if not os.path.exists(results_file):
        print("No results file found")
        sys.exit(1)

    with open(results_file) as f:
        results = json.load(f)

    # PR info
    pr_number = pr_payload.get("number", "")
    pr_title  = pr_payload.get("title", "")
    pr_branch = pr_payload.get("head", "")
    pr_author = pr_payload.get("author", "")
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # CSV file path
    log_file = "pr_check_log.csv"
    file_exists = os.path.exists(log_file)

    with open(log_file, "a", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)

        # Write header if file is new
        if not file_exists:
            writer.writerow([
                "PR Number", "PR Title", "Branch",
                "Author", "Rule", "Result", "Message", "Timestamp"
            ])

        # Write one row per rule result
        for result in results.get("results", []):
            writer.writerow([
                pr_number,
                pr_title,
                pr_branch,
                pr_author,
                result.get("rule", ""),
                "PASS" if result.get("passed") else "FAIL",
                result.get("message", "").replace("\n", " "),
                timestamp,
            ])

        # Write overall summary row
        overall = "PASS" if results.get("passed") else "FAIL"
        total = len(results.get("results", []))
        passed = sum(1 for r in results.get("results", []) if r.get("passed"))
        failed = total - passed

        writer.writerow([
            pr_number,
            pr_title,
            pr_branch,
            pr_author,
            "OVERALL",
            overall,
            f"{passed} of {total} rules passed, {failed} failed",
            timestamp,
        ])

    print(f"✅ Logged {total} rule results + 1 overall summary to {log_file}")


if __name__ == "__main__":
    main()
