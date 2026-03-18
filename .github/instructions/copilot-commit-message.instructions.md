---
description: "Use when generating or suggesting git commit messages. Enforces Conventional Commits format, CommitLint config-conventional types, scope extraction from branch name (e.g. DEV-123), and project-specific body/footer length rules."
name: "Copilot Commit Message"
---

# Copilot Commit Message

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

## Scope — Extract from Branch Name

1. Run `git rev-parse --abbrev-ref HEAD` to get the current branch name.
2. If the branch name contains a pattern matching `[A-Z]+-[0-9]+` (e.g. `DEV-123`, `PROJ-456`, `FEAT-78`), extract it and use it as the scope.
3. If no such code is found, scope is optional — use a short module/area name if helpful (e.g. `auth`, `user`, `database`).

Examples:
| Branch | Scope |
|---|---|
| `feat/TEC-123-add_login` | `TEC-123` |
| `feature/DEV-123-add-login` | `DEV-123` |
| `fix/PROJ-456-null-pointer` | `PROJ-456` |
| `chore/update-dependencies` | `deps` (optional, descriptive) |
| `main` | *(omit scope)* |

## Allowed Types

From `@commitlint/config-conventional` and this project's `.releaserc.json`:

| Type | When to Use |
|---|---|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `perf` | Performance improvement |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or correcting tests |
| `docs` | Documentation only changes |
| `style` | Formatting, whitespace — no logic change |
| `build` | Changes to build system or external dependencies |
| `ci` | Changes to CI/CD configuration or scripts |
| `chore` | Maintenance tasks not modifying src or test files |
| `revert` | Reverts a previous commit |

## Special Scopes (affect semantic versioning)

| Type + Scope | Release effect |
|---|---|
| `build(release)` | minor release |
| `refactor(perf*)` | minor release |
| `chore(build)` | minor release |
| `chore(fix)` | patch release |
| `ci(fix)` | patch release |
| `*(no-release)` | no release triggered |

Use `BREAKING CHANGE` or `BREAKING CHANGES` in the footer to trigger a major release.

## Length Rules

- **Header**: maximum 100 characters.
- **Body lines**: maximum 200 characters per line.
- **Footer lines**: maximum 150 characters per line.

## Body

- Separate from header with a blank line.
- Explain **what** and **why**, not how.
- Use imperative mood.

## Footer

- Separate from body with a blank line.
- Reference issues or breaking changes:
  ```
  BREAKING CHANGE: <description>
  Closes #123
  Refs: PROJ-456
  ```

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

## Generation Checklist

- [ ] Type is one of the allowed types above.
- [ ] Scope extracted from branch name if `[A-Z]+-[0-9]+` pattern present.
- [ ] Header is lowercase, imperative, no trailing period, ≤ 100 chars.
- [ ] Body explains what/why (not how), lines ≤ 200 chars.
- [ ] Footer references issues or breaking changes as applicable, lines ≤ 150 chars.
- [ ] `BREAKING CHANGE` used in footer when the commit introduces incompatible changes.
