# Linting — ESLint to Oxlint Migration

This project migrated from [ESLint](https://eslint.org/docs/latest/) + [Prettier](https://prettier.io/docs/) to the [Oxc](https://oxc.rs/) toolchain — [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) for formatting.

The previous configuration lived in `eslint.config.ts` (still available on the `main` branch, before the migration commits). This document registers the rules from that file that were **not** carried over to [`.oxlintrc.json`](../.oxlintrc.json), so the loss of coverage is explicit and searchable.

Availability was checked against the rule list shipped in `node_modules/oxlint/configuration_schema.json` for **oxlint 1.77.0** (847 registered rules).

## 1. Stylistic rules — replaced by Oxfmt and EditorConfig

Oxlint does not implement formatting rules at all: none of the names below exist in its rule registry. They are now covered by [`.oxfmtrc.json`](../.oxfmtrc.json) or [`.editorconfig`](../.editorconfig), so the *behaviour* survived even though the rules did not.

| ESLint rule | Old value | Replaced by |
| --- | --- | --- |
| `indent` | `['error', 'tab', { SwitchCase: 1 }]` | `.editorconfig` → `indent_style = tab`, `indent_size = 2` |
| `quotes` | `['error', 'single']` | `.oxfmtrc.json` → `singleQuote: true` |
| `jsx-quotes` | `['error', 'prefer-single']` | `.oxfmtrc.json` → `jsxSingleQuote: true` |
| `semi`, `semi-style`, `semi-spacing` | `error` | `.oxfmtrc.json` → `semi: true` |
| `comma-dangle` | `off` | `.oxfmtrc.json` → `trailingComma: 'all'` (**behaviour change**: trailing commas are now enforced) |
| `quote-props` | `['error', 'as-needed', { keywords: false }]` | `.oxfmtrc.json` → `quoteProps: 'as-needed'` |
| `object-curly-spacing` | `['error', 'always']` | `.oxfmtrc.json` → `bracketSpacing: true` |
| `arrow-parens` | `error` | `.oxfmtrc.json` → `arrowParens: 'always'` |
| `max-len` | `['warn', 160]` | `.editorconfig` → `max_line_length = 160` (advisory only) |
| `eol-last` | `error` | `.editorconfig` → `insert_final_newline = true` |
| `no-trailing-spaces` | `error` | `.editorconfig` → `trim_trailing_whitespace = true` |
| `linebreak-style` | `['error', 'unix']` | `.editorconfig` → `end_of_line = lf` |
| `space-infix-ops` | `error` | `.editorconfig` → `spaces_around_operators = true` + Oxfmt |
| `brace-style`, `space-before-blocks`, `space-before-function-paren` | `error` | Oxfmt |
| `comma-style`, `comma-spacing` | `error` | Oxfmt |
| `block-spacing`, `array-bracket-spacing`, `computed-property-spacing`, `space-in-parens` | `error` | Oxfmt |
| `keyword-spacing`, `key-spacing`, `switch-colon-spacing` | `error` | Oxfmt |
| `template-curly-spacing`, `template-tag-spacing`, `rest-spread-spacing`, `yield-star-spacing` | `error` | Oxfmt |
| `space-unary-ops` | `['error', { words: true, nonwords: false }]` | Oxfmt |
| `operator-linebreak` | `['error', 'none', { overrides: … }]` | Oxfmt |
| `no-multiple-empty-lines` | `['error', { max: 2, maxEOF: 1, maxBOF: 1 }]` | Oxfmt (not configurable) |
| `implicit-arrow-linebreak` | `warn` | Oxfmt |
| `dot-location` | `['error', 'property']` | Oxfmt |
| `new-parens` | `error` | Oxfmt |
| `lines-around-directive` | `['error', 'always']` | Oxfmt |
| `no-extra-parens` | `warn` | Oxfmt |
| `func-call-spacing`, `function-call-argument-newline` | `off` | Oxfmt — were already disabled |

## 2. Rules with no Oxlint equivalent — coverage lost

These are **not** formatting concerns and have no replacement in oxlint 1.77.0. Nothing enforces them today.

| ESLint rule | Old value | Notes |
| --- | --- | --- |
| [`camelcase`](https://eslint.org/docs/latest/rules/camelcase) | `warn` | Naming convention for identifiers is now unchecked. |
| [`no-invalid-this`](https://eslint.org/docs/latest/rules/no-invalid-this) | `error` | `this` outside a class/method context is no longer flagged. |
| [`no-undef-init`](https://eslint.org/docs/latest/rules/no-undef-init) | `warn` | `let x = undefined` is no longer flagged. |
| [`spaced-comment`](https://eslint.org/docs/latest/rules/spaced-comment) | `warn` (with `/`, `_`, `-`, `+`, `*`, `!` markers) | Comment marker style is unchecked; the `// ?`, `// *`, `// !` annotation style used across the codebase is now convention only. |
| [`wrap-iife`](https://eslint.org/docs/latest/rules/wrap-iife) | `['error', 'inside', { functionPrototypeMethods: true }]` | — |
| [`wrap-regex`](https://eslint.org/docs/latest/rules/wrap-regex) | `error` | — |
| [`one-var`](https://eslint.org/docs/latest/rules/one-var) | `off` | Was already disabled — no impact. |

### Plugin rules

| Plugin / rule | Old value | Notes |
| --- | --- | --- |
| [`import/order`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md) | `error`, with `pathGroups` for every `@core`/`@domain`/`@app`/`@api`/`@graphql`/`@events`/`@common`/`@dev`/`tests` alias and `@shared` last | Oxlint has no `import/order` rule. Documented as a recommendation in [CONTRIBUTING](../.github/CONTRIBUTING.md#import-order). |
| [`import/no-extraneous-dependencies`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md) | `error`, allowing `devDependencies` under `src/dev/**`, `scripts/**`, `tests/**` | Not available in oxlint. Importing an undeclared or dev-only dependency from production code is no longer caught at lint time. |
| [`eslint-plugin-security`](https://github.com/eslint-community/eslint-plugin-security): `detect-possible-timing-attacks`, `detect-object-injection`, `detect-non-literal-fs-filename`, `detect-non-literal-regexp` | `error` / `error` / `warn` / `warn` | Oxlint ships no security plugin. Partially offset by [CodeQL](../.github/workflows/codeql-analysis.yml) and [SonarQube](../.github/workflows/sonarqube.yml) in CI, which run per pull request instead of per keystroke. |
| [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc) | plugin loaded, **no rules configured** | Nothing was being enforced — no impact. |
| [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) | plugin loaded, **no rules configured** | Superseded by Oxfmt. |

### TypeScript rules dropped while already disabled

Both were `off` in the ESLint config, so removing them changes nothing:

- [`@typescript-eslint/member-ordering`](https://typescript-eslint.io/rules/member-ordering/)
- [`@typescript-eslint/naming-convention`](https://typescript-eslint.io/rules/naming-convention/)

## 3. Rules that were migrated under a different name

Listed here to avoid re-reporting them as missing. Oxlint drops the `@typescript-eslint/` prefix in favour of its own `typescript/` namespace, and implements some TS-extension rules under their base ESLint name:

| ESLint rule | Oxlint rule |
| --- | --- |
| `@typescript-eslint/no-unused-vars` | `no-unused-vars` |
| `@typescript-eslint/no-unused-expressions` | `no-unused-expressions` |
| `@typescript-eslint/no-use-before-define` | `no-use-before-define` |
| `@typescript-eslint/no-empty-function` | `no-empty-function` |
| `@typescript-eslint/no-shadow` | `no-shadow` |
| `@typescript-eslint/no-parameter-properties` | `typescript/parameter-properties` |
| `@typescript-eslint/*` (remaining) | `typescript/*` |
| `js.configs.recommended.rules` | `categories.correctness: 'error'` plus the explicit rule list |

## Re-checking this document

To confirm whether a rule has become available in a newer oxlint release:

```bash
node -e "const s=require('./node_modules/oxlint/configuration_schema.json'); \
	console.log(Object.keys(s.definitions.DummyRuleMap.properties).includes('camelcase'))"
```

When a rule from section 2 becomes available, enable it in [`.oxlintrc.json`](../.oxlintrc.json) and remove its row here.
