# Contributing

Thanks for contributing to **Node BackEnd Boilerplate**. This document describes the tooling and conventions enforced in this repository: editor settings, linter, formatter, Git hooks and commit standards.

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Editor Configuration](#editor-configuration)
	- [EditorConfig](#editorconfig)
	- [Visual Studio Code](#visual-studio-code)
- [Linter — Oxlint](#linter--oxlint)
	- [Import Order](#import-order)
- [Formatter — Oxfmt](#formatter--oxfmt)
- [Type Checking](#type-checking)
- [Tests](#tests)
- [Git Hooks — Lefthook](#git-hooks--lefthook)
- [Commit Standards](#commit-standards)
	- [Format](#format)
	- [Allowed Types](#allowed-types)
	- [Scope](#scope)
	- [Length Rules](#length-rules)
	- [Breaking Changes](#breaking-changes)
	- [Assisted Commits — Commitizen](#assisted-commits--commitizen)
- [Releases — Semantic Release](#releases--semantic-release)
- [Pull Requests](#pull-requests)

## Requirements

Declared in [`package.json`](../package.json) under `engines`:

| Tool | Version |
| --- | --- |
| [Node.js](https://nodejs.org/en/docs) | `>=24.0.x <=24.x.x` |
| [npm](https://docs.npmjs.com/) | `>=12.0.x <=12.x.x` |
| Yarn | `0` — **not supported** |

> **npm is the only supported package manager.** The repository ships a single lockfile ([`package-lock.json`](../package-lock.json)) and `engines.yarn` is pinned to `0` on purpose, so `yarn install` aborts during `package.json` validation. Do not commit a `yarn.lock` or a `pnpm-lock.yaml`.

## Getting Started

```bash
git clone https://github.com/AlvaroDavi5/Node_BackEnd_Boilerplate-TypeScript.git
cd Node_BackEnd_Boilerplate-TypeScript

npm install          # also runs `lefthook install` through the postinstall script
npm run start:dev
```

The `postinstall` script installs the Git hooks, so hooks are active right after the first install.

## Editor Configuration

### EditorConfig

[EditorConfig](https://editorconfig.org/) is the baseline for whitespace and encoding, applied to every file type through [`.editorconfig`](../.editorconfig). Install the [EditorConfig editor plugin](https://editorconfig.org/#download) so your editor honours it.

Global defaults (`[*]`):

| Setting | Value |
| --- | --- |
| `charset` | `utf-8` |
| `indent_style` | `tab` |
| `indent_size` / `tab_width` | `2` |
| `quote_type` | `single` |
| `max_line_length` | `160` |
| `trim_trailing_whitespace` | `true` |
| `end_of_line` | `lf` |
| `insert_final_newline` | `true` |

Per-language overrides:

- **`*.{js,ts,jsx,tsx}`** — no line break before curly brackets, spaces around operators, spaces inside brackets.
- **`*.{json,jsonc}`** and **`*.{sh,bash,zsh}`** — tabs, width `2`.
- **`*.{yml,yaml}`** — **spaces**, width `2` (YAML does not allow tabs).
- **`*.md`** — trailing whitespace is preserved (it is meaningful for Markdown line breaks).

### Visual Studio Code

[`.vscode/settings.json`](../.vscode/settings.json) and [`.vscode/extensions.json`](../.vscode/extensions.json) are committed, so the workspace comes pre-configured:

- Indentation with tabs (`editor.insertSpaces: false`, `editor.tabSize: 2`) and format on save.
- The [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) (ships both Oxlint and Oxfmt) is pointed at the repository configs via `oxc.configPath` and `oxc.fmt.configPath`.
- `source.fixAll.oxc` runs on save; unused imports are removed automatically.

The [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions are listed under `unwantedRecommendations` — this project has migrated to the Oxc toolchain and mixing them in causes conflicting fixes on save.

## Linter — Oxlint

Linting is handled by [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (part of the [Oxc](https://oxc.rs/) toolchain, a Rust-based replacement for [ESLint](https://eslint.org/docs/latest/)), configured in [`.oxlintrc.json`](../.oxlintrc.json).

```bash
npm run lint          # report issues in src, tests and scripts
npm run lint:fix      # apply auto-fixes (quiet)
npm run lint:strict   # treat warnings as errors — same gate used by the pre-commit hook
```

Configuration highlights:

- **Plugins:** `typescript`, `oxc`, `unicorn`, `import`.
- **Categories:** the whole `correctness` category is set to `error`.
- **Environments:** `builtin`, `es2024`, `node`, `browser`, `jest`.
- `reportUnusedDisableDirectives` is set to `warn`, so stale suppression comments surface.
- **Ignored paths:** `node_modules`, `build`, `coverage`, `site`, `.scannerwork`.

Notable enforced rules — see the [Oxlint rule reference](https://oxc.rs/docs/guide/usage/linter/rules.html) for each one:

- `no-console` and `no-debugger` are errors (relaxed for `src/shared/internal/decorators/**`, `src/dev/**`, `scripts/**` and `tests/**`).
- `max-classes-per-file: 1` (relaxed under `tests/**`).
- `eqeqeq: always`, `no-var`, `prefer-template`, `prefer-destructuring`, `prefer-spread`, `prefer-rest-params`, `no-bitwise`, `no-eval`, `complexity`.
- `no-unused-vars` — prefix an intentionally unused binding, argument or caught error with `_`.
- `id-denylist` — the identifiers `e`, `a`, `b` and `cb` are rejected; use descriptive names (`error`, `callback`, …).
- `no-shadow` with `hoist: all`, `no-use-before-define`, `no-empty-function`.
- TypeScript rules: `ban-ts-comment`, `array-type`, `consistent-type-assertions`, `no-empty-interface`, `no-var-requires`, `no-namespace`, `prefer-for-of`, `unified-signatures`; `no-explicit-any` is a **warning** (off under `src/dev/**`, `scripts/**` and `tests/**`), and `no-non-null-assertion` is off.
- `no-restricted-types` — use the lowercase primitives (`object`, `string`, `number`, `boolean`, `symbol`) and specific function types instead of `Object`, `String`, `Function`, …

### Import Order

Imports are recommended to follow this order:

| # | Group | Examples |
| --- | --- | --- |
| 1 | `builtin` | `node:crypto`, `path` |
| 2 | `external` | `@nestjs/common`, `typeorm` |
| 3 | `internal` — path aliases | `@core/*`, `@domain/*`, `@app/*`, `@api/*`, `@graphql/*`, `@events/*`, `@common/*`, `@dev/*`, `tests/*` |
| 4 | `internal` — `@shared/*` | `@shared/internal/interfaces/*` — always **last** among the aliases |
| 5 | `parent` | `../services/User.service` |
| 6 | `sibling` | `./User.entity` |
| 7 | `index` | `./` |
| 8 | `object` / `type` | `import type { … }` |

Additional conventions:

- **No blank lines between groups** — the whole import block stays contiguous.
- **No alphabetical sorting** — within a group, imports stay in the order that reads best.
- Type-only imports are **not** exempt from the alias grouping.

Example — [`src/modules/app/file/api/controllers/File.controller.ts`](../src/modules/app/file/api/controllers/File.controller.ts):

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import FileService from '@app/file/services/File.service';
import AuthGuard from '@api/guards/Auth.guard';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import type { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';
```

JSON objects are imported as a default import — `resolveJsonModule` is enabled — and belong to the group of the path they come from, as in [`scripts/send-message.ts`](../scripts/send-message.ts):

```typescript
import sendMessage from '@dev/localstack/queues/sendMessage';
import eventPayload from '@dev/templates/payloads/EventPayload.json';
import { configServiceMock } from '@dev/mocks/mockedModules';
```

The aliases themselves are declared under `compilerOptions.paths` in [`tsconfig.base.json`](../tsconfig.base.json).

> Oxlint does not currently enable an import-order rule in [`.oxlintrc.json`](../.oxlintrc.json), so this ordering is a **recommendation** rather than an automated gate — keep it consistent by hand.

## Formatter — Oxfmt

Formatting is handled by [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html), configured in [`.oxfmtrc.json`](../.oxfmtrc.json). It replaces [Prettier](https://prettier.io/docs/) — do not add a Prettier config.

```bash
npm run format        # check formatting only (fails on drift)
npm run format:fix    # rewrite files in place
```

| Option | Value |
| --- | --- |
| `singleQuote` / `jsxSingleQuote` | `true` |
| `quoteProps` | `as-needed` |
| `semi` | `true` |
| `trailingComma` | `all` |
| `bracketSpacing` | `true` |
| `arrowParens` | `always` |
| `objectWrap` | `preserve` |
| `sortPackageJson` | `false` |

Ignored paths: `node_modules`, `build`, `coverage`, `site`, `.scannerwork`, `CHANGELOG.md` (the changelog is generated).

Indentation itself comes from [EditorConfig](#editorconfig): **tabs, width 2**.

## Type Checking

```bash
npm run typecheck     # tsc --project tsconfig.json --noEmit
```

Configs: [`tsconfig.base.json`](../tsconfig.base.json), [`tsconfig.json`](../tsconfig.json), [`tsconfig.build.json`](../tsconfig.build.json) and [`tsconfig.test.json`](../tsconfig.test.json). See the [TypeScript `tsconfig` reference](https://www.typescriptlang.org/tsconfig).

## Tests

Tests run on [Jest](https://jestjs.io/docs/getting-started) with three separate suites and configs under [`tests/`](../tests):

```bash
npm run test              # unit + integration + e2e
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage     # coverage for every suite
```

Each suite also accepts `:watch`, `:coverage` and `:#it` (filters tests tagged `#it`) variants.

## Git Hooks — Lefthook

Hooks are managed by [Lefthook](https://lefthook.dev/configuration/) through [`lefthook.yml`](../lefthook.yml) and installed by the `postinstall` script.

| Hook | Jobs |
| --- | --- |
| `commit-msg` | `npx commitlint --edit $1` — validates the commit message |
| `pre-commit` (parallel) | `npm run typecheck`; `npx oxlint --config .oxlintrc.json {staged_files} --deny-warnings` over staged `*.{js,ts,jsx,tsx}` |
| `pre-push` | `npm run build`; `npm run security-check`; `npm run test:unit`; `npm run test:integration` |

Run `npx lefthook install` manually if hooks are ever missing. Do not bypass them with `--no-verify` unless a maintainer asks you to.

## Commit Standards

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) — the syntax that drives [Semantic Versioning](https://semver.org/) (a.k.a. *semantic commits*). They are validated by [commitlint](https://commitlint.js.org/) with [`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional), configured in [`commitlint.config.ts`](../commitlint.config.ts).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

- The **header** is mandatory; **body** and **footer** are optional but recommended for non-trivial changes.
- The short description must be lowercase, in the imperative mood (`add`, `fix`, `update`) and must not end with a period.
- Separate header, body and footer with a blank line.
- The body explains **what** and **why**, not how.

### Allowed Types

| Type | When to use | Release effect |
| --- | --- | --- |
| `feat` | New feature for the user | minor |
| `fix` | Bug fix for the user | patch |
| `perf` | Performance improvement | patch |
| `refactor` | Change that is neither a fix nor a feature | none¹ |
| `test` | Adding or correcting tests | none |
| `docs` | Documentation only | none |
| `style` | Formatting, whitespace — no logic change | none |
| `build` | Build system or external dependencies | none¹ |
| `ci` | CI/CD configuration or scripts | none¹ |
| `chore` | Maintenance not touching `src` or `test` files | none¹ |
| `revert` | Reverts a previous commit | patch |

¹ Unless combined with one of the [special scopes](#releases--semantic-release).

### Scope

The scope is optional. Rules used in this project:

1. If the branch name contains a task code matching `[A-Z]+-[0-9]+` (e.g. `feat/DEV-123-add-login`), use that code as the scope: `feat(DEV-123): add login endpoint`.
2. Otherwise use a short module or area name — `auth`, `user`, `database`, `deps`, `linting`, …
3. On branches without either, omit the scope.

### Length Rules

Enforced by [`commitlint.config.ts`](../commitlint.config.ts) plus the conventional preset:

| Part | Limit |
| --- | --- |
| Header | 100 characters |
| Body lines | 200 characters (`body-max-line-length`) |
| Footer lines | 150 characters (`footer-max-line-length`) |

### Breaking Changes

Add a `BREAKING CHANGE:` or `BREAKING CHANGES:` footer (the keywords configured in [`.releaserc.json`](../.releaserc.json)) to trigger a **major** release:

```
refactor(DEV-78): extract password validation to CryptographyService

BREAKING CHANGE: validatePassword now throws instead of returning false
```

Footers may also reference issues:

```
Closes #89
Refs: PROJ-456
```

### Assisted Commits — Commitizen

[Commitizen](https://commitizen-tools.github.io/commitizen/) is configured with the [`cz-conventional-changelog`](https://github.com/commitizen/cz-conventional-changelog) adapter:

```bash
npm run commit        # git-cz — interactive prompt that builds a valid message
```

Examples of valid messages:

```
feat(DEV-123): add user authentication endpoint
```

```
fix(PROJ-456): prevent null pointer on empty user list

The list method was not checking for empty results before accessing the
first element, causing a runtime error.

Closes #89
```

```
chore(no-release): update local development docs
```

## Releases — Semantic Release

Versioning and publishing are automated by [semantic-release](https://semantic-release.gitbook.io/semantic-release/), configured in [`.releaserc.json`](../.releaserc.json) and run by the [`releasing.yml`](workflows/releasing.yml) workflow.

```bash
npm run versioning    # semantic-release
```

- **Release branches:** `main` and `release`. Tags follow `v${version}`.
- Commit analysis uses the [`conventionalcommits`](https://github.com/conventional-changelog/conventional-changelog-config-spec) preset.
- Release notes are grouped by type (`🚀 Features`, `🐛 Bug Fixes`, `⚡️ Performance Improvements`, `🔧 CI/CD`, `🔨 Chore`, `🧹 Code Refactoring`, `📚 Documentation`, `🧪 Tests`, `⏪ Reverts`); `style` and `build` are hidden.
- `npmPublish` is disabled — artifacts (WebPack zip, tarball and `CHANGELOG.md`) are attached to the GitHub release instead.

Custom release rules — these override the defaults from the table above:

| Type + Scope | Effect |
| --- | --- |
| `*(no-release)` | no release |
| `build(release)` | minor |
| `refactor(perf*)` | minor |
| `chore(build)` | minor |
| `chore(fix)` | patch |
| `ci(fix)` | patch |

## Pull Requests

1. Branch off `develop` using a descriptive name — include the task code when there is one (`feat/DEV-123-add-login`).
2. Keep commits conventional; add or update tests for your change.
3. Before pushing, make sure the local gates pass:
	```bash
	npm run typecheck
	npm run lint:strict
	npm run format
	npm run test
	```
4. Open the pull request against `develop` and fill in [`pull_request_template.md`](pull_request_template.md).
5. CI must be green — [`build-application.yml`](workflows/build-application.yml), [`security-check.yml`](workflows/security-check.yml), [`codeql-analysis.yml`](workflows/codeql-analysis.yml) and [`sonarqube.yml`](workflows/sonarqube.yml).

Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) and the [Security Policy](SECURITY.md).
