---
name: find-edge-cases
description: Hunt the edge cases in code at a fixed point (commit, branch, tag, `HEAD`, `HEAD~5`) — boundary inputs, empty/null, overflow, concurrency, time, and failure modes the code doesn't handle — and validate each with a concrete trigger before presenting it, so the user decides on real cases, not speculation. Use when the user asks what could break, what edge cases are missed, to stress-test a function or change, or to check robustness before shipping.
---

An **edge case** is a boundary input or state the code meets but doesn't handle correctly. A candidate becomes a real edge case only when you can name its **trigger** — the concrete input or state that drives _this_ code to a crash, wrong result, corruption, or hang. **No trigger, no edge case.** The skill's job is to separate real cases from speculation and hand the user only the validated ones, each with the evidence to decide.

The review is **report-only**: anticipate, detect, assert, present. It never edits code — the user acts on the findings.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it. This is the version of the code to analyze; read files at it with `git show <fixed-point>:<path>`.

Confirm it resolves (`git rev-parse <fixed-point>`). A bad ref should fail here, not deep in the hunt.

Completion: fixed point confirmed to resolve.

### 2. Scope the hunt

Edge-case hunting needs a bounded surface — never "the whole repo". Resolve the scope:

- If the user named files, functions, or a module → that is the scope.
- Otherwise, default to the change the fixed point introduces (`git show <fixed-point>`) — the newly added or modified code. Confirm it's non-empty.

If the surface is large, ask the user to confirm or narrow before hunting.

Completion: a bounded, non-empty surface of code to hunt over.

### 3. Anticipate — enumerate candidates

For every input, parameter, boundary, and external interaction in scope, derive candidate edge cases from the families below. Sweep them systematically so the same code yields the same candidates every run — don't cherry-pick the "interesting" ones.

**Edge-case families:**

- **Absence** — null, undefined, missing field, empty string / collection, optional not provided.
- **Boundaries** — zero, negative, min/max, off-by-one, first / last, single element, exactly at the limit.
- **Magnitude** — integer overflow, huge inputs, float precision / rounding, truncation.
- **Text** — unicode / emoji, encoding, leading / trailing / only whitespace, very long, control or injection characters.
- **Time & order** — timezones, DST, leap day, clock skew, events out of order, duplicate or replayed.
- **Concurrency** — races, reentrancy, double-submit, idempotency, partial failure mid-operation.
- **External** — network error, timeout, slow / partial / malformed response, rate limit, resource exhaustion.
- **State** — uninitialized, stale, out-of-order calls, invalid combinations of otherwise-valid fields.

Completion: every in-scope input and boundary run against every family — candidates listed, none skipped because the code "looks fine".

### 4. Detect & assert — the trigger

For each candidate, test it against the code as it exists at the fixed point. It survives only if all three hold:

1. **Reachable** — the boundary input can actually arrive at this code; it isn't already blocked by an upstream **guard**, a type constraint, or a validated caller.
2. **Unhandled** — the code has no **guard** (check, default, clamp, try/catch) that already handles it correctly.
3. **Consequential** — it produces a concrete bad outcome: crash, wrong value, data loss, hang, security hole.

Then construct the **trigger**: the concrete input / state, plus the exact line where the code breaks and what it does wrong. If you cannot construct a trigger — a guard neutralizes it, it's unreachable, or the outcome is actually fine — the candidate is **speculation**; drop it. This assertion is the point of the skill: the user's time is spent only on cases proven real.

Completion: every candidate resolved to _validated_ (has a trigger) or _dropped_ (guard / unreachable / no bad outcome) — no candidate carried forward without a trigger.

### 5. Present for decision

Present only validated edge cases, worst first, each as a structured finding (see **Finding format**). State the count of candidates considered and dropped, so the user knows the surface was swept, not skimmed.

Frame each as a decision, not a mandate: **handle it**, **accept it deliberately**, or **rule it out of scope**. Suggest a handling approach only when it's obvious — don't invent fixes. If nothing survives, say so plainly; don't manufacture findings to look thorough.

Completion: every validated edge case presented with its trigger and decision options; drop count reported.

## Finding format

Every finding is a structured block. A finding without a trigger is a **format failure**, not brevity.

1. **Citation** — `startLine:endLine:filepath` (e.g. `42:57:src/orders.ts`). Mandatory, always.
2. **Edge case** — the family and the boundary, in one line.
3. **Trigger** — the concrete input / state that reaches the code, and the line where it breaks. This is the assertion that the case is real — mandatory, no finding without one.
4. **Consequence** — what goes wrong: the crash, wrong value, corruption, or hang. State the outcome, not a severity label.
5. **Current behaviour** — what the code does today at that input, including any guard that _almost_ covers it.
6. **Decision** — the options (handle / accept / out of scope), with a one-line suggested handling only if obvious.

Add an input→output table when it clarifies expected vs actual:

| Input        | Expected   | Code produces     |
| ------------ | ---------- | ----------------- |
| `[]` (empty) | return `0` | throws at line 48 |
