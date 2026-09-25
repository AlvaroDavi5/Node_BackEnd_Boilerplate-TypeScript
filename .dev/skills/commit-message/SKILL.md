---
name: commit-message
description: Generate a Conventional Commits / Semantic Commits message from the current changes. Looks at staged files first, falls back to the working tree, then to a diff against main/master if nothing is staged or modified. Picks a valid type and optional scope (TASK-ID, deps, dev...), writes a header + body, and signs off with the user and Claude as co-author. Use when the user asks to write, suggest, or generate a commit message, or asks to commit.
argument-hint: (optional) ticket ID or scope hint
user-invocable: true
---

# Commit Message

Enforces Conventional Commits format, CommitLint config-conventional types, scope extraction from
branch name (e.g. DEV-123), and project-specific body/footer length rules. Also covers **where to
source the diff from** when nothing is staged, and the **sign-off/co-author footer**.

## When to Use

- The user asks to write/suggest a commit message.
- The user asks to commit changes (draft the message first, get approval, then stage/commit per
  the git safety rules — never commit without explicit confirmation).

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

**Allowed types** (from `@commitlint/config-conventional` and this project's `.releaserc.json`):

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
   drafting the header — don't silently omit it or guess one. If the user confirms there isn't
   one, scope is optional — use a short module/area name if helpful (e.g. `auth`, `user`,
   `database`, `deps`).

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

Use `BREAKING CHANGE` or `BREAKING CHANGES` in the footer to trigger a major release.

### Step 4 — Draft the message

- **Header**: `<type>(<scope>): <short description>` — lowercase, imperative mood, no trailing
  period, ≤ 100 chars.
- **Body** (for non-trivial changes): separate from header with a blank line. Explain **what** and
  **why** per file/module (not how), based on the actual diff content — not just filenames. Use
  imperative mood. Lines ≤ 200 chars.
- **Footer**: separate from body with a blank line.
  - Issue refs / `BREAKING CHANGE:` when applicable, lines ≤ 150 chars, e.g.:
    ```
    BREAKING CHANGE: <description>
    Closes #123
    Refs: PROJ-456
    ```
  - Always ask the user whether to include `Signed-off-by`/`Co-Authored-By` lines before adding
    them — never add them silently. If they agree:
    - `Signed-off-by: <name> <email>` — get `<name>`/`<email>` from `git config user.name` and
      `git config user.email`.
    - `Co-Authored-By: Claude <noreply@anthropic.com>`

### Step 5 — Present and ask to commit

Show the drafted message to the user, then ask whether to commit it as-is.

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

BREAKING CHANGE: validatePassword now throws instead of returning false
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
  inventing or omitting one outright.

## Completion Criteria

- [ ] Change source identified and stated (staged / working tree / branch diff).
- [ ] Diff actually analyzed — type, scope, and body reflect real content, not just file names.
- [ ] Type is one of the allowed types above.
- [ ] Task ID/scope taken from the branch name, or explicitly asked about if the branch has none.
- [ ] Header follows format rules (lowercase, imperative, no period, ≤ 100 chars).
- [ ] Body (if present) explains what/why, lines ≤ 200 chars.
- [ ] Footer includes issue refs/breaking changes if applicable (≤ 150 chars/line), plus
      `Signed-off-by`/`Co-Authored-By: Claude` only if the user opted in.
- [ ] User explicitly asked whether to include `Signed-off-by`/`Co-Authored-By` before adding
      either.
- [ ] User explicitly asked whether to commit the displayed message.
- [ ] If agreed: committed with the exact displayed message (header+body+footer), no retyping.
- [ ] If declined: message only displayed — no `git add`/`git commit` run.
