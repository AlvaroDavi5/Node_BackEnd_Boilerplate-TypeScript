---
name: commit-message
description: Generate a Conventional Commits / Semantic Commits message from the current changes. Looks at staged files first, falls back to the working tree, then to a diff against main/master if nothing is staged or modified. Picks a valid type and optional scope (TASK-ID, deps, dev...), checks the diff for breaking changes and asks the user to confirm and describe them, writes a header + body, and signs off with the user and Claude as co-author. Pass "without ask" to skip every question and use the default presets (no breaking change). Use when the user asks to write, suggest, or generate a commit message, or asks to commit.
argument-hint: (optional) ticket ID or scope hint, and/or "without ask"
user-invocable: true
---

# Commit Message

Enforces Conventional Commits format, CommitLint config-conventional types, scope extraction from
branch name (e.g. DEV-123), breaking change checks, and project-specific body/footer length rules.
Also covers **where to source the diff from** when nothing is staged, and the **sign-off/co-author
footer**.

## When to Use

- The user asks to write/suggest a commit message.
- The user asks to commit changes (draft the message first, get approval, then stage/commit per
  the git safety rules — never commit without explicit confirmation, except in the "without ask"
  mode below).

## Modes

Check the user's input (the skill arguments and the request itself) before starting:

- **Interactive (default)**: follow every step, including the questions about the task ID,
  breaking changes, sign-off/co-author footer, and whether to commit.
- **Without ask**: if the input includes `without ask` (case-insensitive), do not ask the user
  anything — no task ID, breaking change, footer, or commit questions. Use only the default
  presets:

  | Decision        | Preset                                                                                                  |
  | --------------- | ------------------------------------------------------------------------------------------------------- |
  | Change source   | Same priority as Step 1                                                                                 |
  | Scope           | Task ID from the branch name; otherwise a short area name only if it adds clarity, or omit it           |
  | Breaking change | **Never added** — no `BREAKING CHANGE` footer and no `!` in the header, even if the checks flag one     |
  | Sign-off footer | Always added: `Signed-off-by` from `git config` plus `Co-Authored-By: Claude`                           |
  | Commit          | Commit directly when the source is the staged changes; otherwise only display the message (never stage) |

  If the breaking change checks (Step 4) flag a possible breaking change, still leave it out of the
  message, but mention it to the user after the commit so they can amend it if needed.

## Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

- **Header** is mandatory.
- **Body** and **footer** are optional, but recommended for non-trivial changes.
- Header must not end with a period.
- Short description must be in lowercase and imperative mood (e.g. `add`, `fix`, `update`).

## Procedure

### Step 1 — Pick the change source (in priority order)

1. **Staged changes**: `git diff --staged --name-only`. If non-empty, use `git diff --staged` as
   the diff to analyze. This is the preferred source — it's what will actually be committed.
2. **Working tree**: if nothing is staged, check `git status --porcelain` for modified/untracked
   tracked files. If non-empty, use `git diff` (unstaged) as the diff to analyze. Tell the user
   these changes aren't staged yet — the message is a preview, not commit-ready.
3. **Diff against main/master**: if the working tree is clean too, find the default branch
   (`git symbolic-ref refs/remotes/origin/HEAD` or fall back to checking for `main` then `master`),
   then diff the current branch against it: `git diff <default-branch>...HEAD`. Use this to
   summarize what the whole branch would introduce if merged.
4. If all three are empty, stop and tell the user there are no changes to describe.

Always state which source was used, since it changes what the message actually represents.

### Step 2 — Analyze the diff

From the chosen diff, identify:

- **What changed**: new files, deleted files, modified logic, renamed symbols, added/removed
  dependencies.
- **Why it changed** (when inferable from context): fixing a bug, adding a feature, refactoring,
  etc.
- **Affected modules or layers**: e.g. controller, service, repository, config, tests.

Use this analysis to choose the correct commit **type**, write a precise **short description**,
and draft the **body** explaining what changed and why, based on the actual code — not just the
filenames.

### Step 3 — Determine type and scope

**Allowed types** (from `@commitlint/config-conventional`):

| Type       | When to Use                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | New feature for the user                          |
| `fix`      | Bug fix for the user                              |
| `perf`     | Performance improvement                           |
| `refactor` | Code change that is neither a fix nor a feature   |
| `test`     | Adding or correcting tests                        |
| `docs`     | Documentation only changes                        |
| `style`    | Formatting, whitespace — no logic change          |
| `build`    | Changes to build system or external dependencies  |
| `ci`       | Changes to CI/CD configuration or scripts         |
| `chore`    | Maintenance tasks not modifying src or test files |
| `revert`   | Reverts a previous commit                         |

Pick the type matching the dominant nature of the change; if changes are mixed, pick the type of
the most significant part and mention the rest in the body.

**Scope** — extract from branch name:

1. Run `git rev-parse --abbrev-ref HEAD` to get the current branch name.
2. If the branch name contains a pattern matching `[A-Z]+-[0-9]+` (e.g. `DEV-123`, `PROJ-456`,
   `FEAT-78`), extract it and use it as the scope.
3. If no such code is found, ask the user whether there's a task ID to use as scope before
   drafting the header — don't silently omit it or guess one (in the "without ask" mode, skip the
   question and use the preset). If the user confirms there isn't one, scope is optional — use a
   short module/area name if helpful (e.g. `auth`, `user`, `database`, `deps`).

Examples:

| Branch                      | Scope                          |
| --------------------------- | ------------------------------ |
| `feat/TEC-123-add_login`    | `TEC-123`                      |
| `feature/DEV-123-add-login` | `DEV-123`                      |
| `fix/PROJ-456-null-pointer` | `PROJ-456`                     |
| `chore/update-dependencies` | `deps` (optional, descriptive) |
| `main`                      | _(omit scope)_                 |

**Special scopes** (affect semantic versioning):

| Type + Scope      | Release effect       |
| ----------------- | -------------------- |
| `build(release)`  | minor release        |
| `refactor(perf*)` | minor release        |
| `chore(build)`    | minor release        |
| `chore(fix)`      | patch release        |
| `ci(fix)`         | patch release        |
| `*(no-release)`   | no release triggered |

Use `BREAKING CHANGE` or `BREAKING CHANGES` in the footer to trigger a major release (see Step 4).

### Step 4 — Check for breaking changes

A breaking change is anything that forces consumers (API clients, other packages, deployments,
existing data) to change on their side after this commit.

**4.1 — Scan the diff.** Look for these signals and note each one with its file:

| Area                  | Signals                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public API / routes   | Removed or renamed endpoints, changed HTTP method or path, changed request/response fields, new required fields, changed status codes           |
| Exported code         | Removed or renamed exported functions, types, constants, or fields; changed function signatures or return types                                 |
| Behavior / validation | Input that used to be accepted is now rejected, changed defaults, changed error types or messages that callers match on                         |
| Database              | Migrations that drop or rename tables/columns, change types, add `NOT NULL` without default, or change constraints that existing rows may break |
| Config / environment  | Removed or renamed environment variables, config keys, CLI flags, or changed their meaning                                                      |
| Dependencies / build  | Major version bumps of runtime dependencies, raised minimum language/runtime version, changed build outputs                                     |

Also treat as a strong signal any existing `BREAKING CHANGE` note or `!` mentioned by the user.

**4.2 — Ask the user** (interactive mode only). Always ask whether the commit contains a breaking
change, even if the scan found nothing. Show the signals found (or say none were found) so the
user can decide. Ask this together with the other pending questions (task ID, footer) in a single
round when possible.

**4.3 — If the user confirms a breaking change**, ask for more details: what breaks, who is
affected, and how to migrate. Then **rewrite** the user's answer into the footer description —
do not paste it verbatim:

- Write in English, in a neutral descriptive tone, regardless of the language the user answered in.
- State what breaks first, then the migration path (e.g. `use X instead`, `run migration Y`).
- Remove filler, opinions, and conversational phrasing; keep identifiers in backticks only if
  they are code names.
- Keep each footer line ≤ 150 chars; continue on extra lines if needed.
- Format: `BREAKING CHANGE: <rewritten description>`.

Example — user answer: _"o endpoint de carteiras agora rejeita owner sem país, quem chamava sem
countryCode vai receber 400"_ →

```
BREAKING CHANGE: POST /wallets now rejects new owners without a supported countryCode (BR, US or EU)
and returns 400; send countryCode when creating an owner
```

**4.4 — If the user says there is no breaking change**, or in the "without ask" mode, do not add
any `BREAKING CHANGE` footer or `!` in the header.

### Step 5 — Draft the message

- **Header**: `<type>(<scope>): <short description>` — lowercase, imperative mood, no trailing
  period, ≤ 100 chars.
- **Body** (for non-trivial changes): separate from header with a blank line. Explain **what** and
  **why** per file/module (not how), based on the actual diff content — not just filenames. Use
  imperative mood. Lines ≤ 200 chars.
- **Footer**: separate from body with a blank line.
  - `BREAKING CHANGE:` from Step 4.3 when confirmed, then issue refs when applicable, lines ≤ 150
    chars, e.g.:
    ```
    BREAKING CHANGE: <description>
    Closes #123
    Refs: PROJ-456
    ```
  - Always ask the user whether to include `Signed-off-by`/`Co-Authored-By` lines before adding
    them — never add them silently (in the "without ask" mode, always add them per the preset).
    If they agree:
    - `Signed-off-by: <name> <email>` — get `<name>`/`<email>` from `git config user.name` and
      `git config user.email`.
    - `Co-Authored-By: Claude <noreply@anthropic.com>`

### Step 6 — Present and ask to commit

Show the drafted message to the user, then ask whether to commit it as-is (in the "without ask"
mode, skip the question and follow the commit preset).

- If the user agrees: stage the relevant files if they aren't already staged (confirm which files
  first if the source was the working tree or a branch diff), then run `git commit` with the
  **entire** message exactly as displayed (header, body, and footer) — use a heredoc so formatting
  and line breaks are preserved, don't retype or paraphrase it.
- If the user declines, or the source required staging that wasn't confirmed: only display the
  message. Do not run `git add` or `git commit`.

## Examples

```
feat(DEV-123): add user authentication endpoint
```

```
fix(PROJ-456): prevent null pointer on empty user list

The list method was not checking for empty results before
accessing the first element, causing a runtime error.

Closes #89
```

```
refactor(DEV-78): extract password validation to CryptographyService

BREAKING CHANGE: validatePassword now throws instead of returning false; wrap calls in error handling
```

```
chore(no-release): update local development docs
```

## Decision Points

- No staged, unstaged, or branch-ahead changes anywhere → stop, tell the user there's nothing to
  describe.
- Mixed change types in one diff → pick the dominant type, call out the rest in the body, and
  suggest splitting into multiple commits if the mix is large/unrelated.
- On `main`/`master` with no upstream ticket pattern → ask the user for a task ID rather than
  inventing or omitting one outright (preset in the "without ask" mode).
- Breaking change signals found but the user says there is none → trust the user, leave the
  footer out.
- User confirms a breaking change but gives no details → ask once more for what breaks and how to
  migrate; do not invent the description.
- Input includes `without ask` → no questions at all, default presets, never a `BREAKING CHANGE`
  footer.

## Completion Criteria

- [ ] Mode identified (interactive or "without ask").
- [ ] Change source identified and stated (staged / working tree / branch diff).
- [ ] Diff actually analyzed — type, scope, and body reflect real content, not just file names.
- [ ] Type is one of the allowed types above.
- [ ] Task ID/scope taken from the branch name, or explicitly asked about if the branch has none
      (interactive mode only).
- [ ] Diff scanned for breaking change signals.
- [ ] Interactive mode: user asked whether there is a breaking change; if yes, details requested
      and rewritten into a `BREAKING CHANGE:` footer (≤ 150 chars/line).
- [ ] "Without ask" mode: no questions asked, no `BREAKING CHANGE` footer added, flagged signals
      mentioned to the user afterwards.
- [ ] Header follows format rules (lowercase, imperative, no period, ≤ 100 chars).
- [ ] Body (if present) explains what/why, lines ≤ 200 chars.
- [ ] Footer includes breaking change and issue refs if applicable (≤ 150 chars/line), plus
      `Signed-off-by`/`Co-Authored-By: Claude` only if the user opted in (always in "without ask").
- [ ] Interactive mode: user explicitly asked whether to include `Signed-off-by`/`Co-Authored-By`
      before adding either, and whether to commit the displayed message.
- [ ] If committing: committed with the exact displayed message (header+body+footer), no retyping.
- [ ] If declined (or not staged in "without ask"): message only displayed — no `git add`/`git commit` run.
