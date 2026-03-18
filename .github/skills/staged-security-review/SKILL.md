---
name: staged-security-review
description: "Review staged code for security flaws before commit. Use for git staged diff analysis, secret detection, auth flaws, input validation gaps, SSRF/SQLi/RCE risks, and unsafe configuration checks."
argument-hint: "What should be reviewed in staged changes? (scope: auth | api | database | infra | all)"
user-invocable: true
---

# Staged Security Review

## When to Use
- Before commit or PR when you want a fast security gate on staged changes.
- When staged changes touch: auth, input parsing/validation, database queries, HTTP clients, queue consumers/producers, env/config, or CI/CD scripts.
- When you need actionable findings with severity level and file references.

## Inputs
- A repository with staged files (`git add ...`).
- Optional scope argument: `auth`, `api`, `database`, `infra`, or `all` (default: `all`).

## Procedure

### Step 1 — Enumerate Staged Files
Run: `git diff --cached --name-only --diff-filter=ACMR`

If no staged files, stop and ask the user to stage changes first.

### Step 2 — Prioritize Risky Files
Review in this order:
1. Authentication and authorization code
2. Input parsing, validation, DTO/schema changes
3. Database query code and raw/dynamic SQL
4. HTTP clients, webhooks, queue consumers/producers
5. Env/config files and CI/CD scripts
6. Everything else

### Step 3 — Run Automated Baseline
If `.ts` or `.js` files are staged and `eslint` is available, run:
```
npx eslint <staged_files> --quiet
```

### Step 4 — Manual Diff Review
Review `git diff --cached` looking for:
- Missing authz checks (BOLA/IDOR)
- Missing input validation or sanitization
- Injection vectors: SQL, NoSQL (`$where`, `$regex`), command, template
- SSRF via unvalidated URLs in HTTP client calls
- Unsafe crypto (weak algorithm, hardcoded keys, low entropy)
- Unsafe session/auth handling (no expiry, no rotation)
- Sensitive data exposure in logs or error messages

### Step 5 — Classify Findings
For each finding assign:
- `high` — exploitable and impactful; recommend blocking commit
- `medium` — realistic risk that needs mitigation before merge
- `low` — hard to exploit or defense-in-depth value only

### Step 6 — Report
Output format:
```
## Findings

### [HIGH] <risk name>
- **File:** <path>:<line>
- **Risk:** <what can go wrong>
- **Fix:** <minimal remediation>

## Residual Risks
- <risks not covered by this review>

## Testing Gaps
- <missing test coverage that would catch these issues>

## Recommendation
approve | approve with fixes | block
```

If no findings: state explicitly, list residual risks and testing gaps.

## Decision Points
- If no staged files: stop, ask user to stage changes.
- If scanner finds possible secrets: block commit until removed/rotated secrets.
- If only docs or non-code files staged: return no findings with low residual risk.

## Completion Criteria
- [ ] Staged files enumerated and prioritized by risk.
- [ ] Automated scanner executed on staged content.
- [ ] Manual review covered all high-risk changed files.
- [ ] Each finding includes: severity, file+line evidence, and fix recommendation.
- [ ] Residual risks and testing gaps documented.
- [ ] Final recommendation is one of: `approve`, `approve with fixes`, `block`.
