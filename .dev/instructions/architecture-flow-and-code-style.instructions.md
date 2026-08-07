---
name: "Architecture Flow And Code Style"
description: "Use when implementing or refactoring backend features in NestJS/TypeScript. Enforces architecture flow trigger -> logic_provider -> data_provider, provider responsibilities, naming conventions, immutability and clean code practices."
applyTo: "{src,tests,scripts}/**/*.{ts,js}"
---

# Architecture Flow And Code Style

## Mandatory Architecture Flow
- Respect this execution order: `trigger -> logic_provider -> data_provider`.
- Do not skip layers and do not call `data_provider` directly from `trigger`.
- `logic_provider` may delegate to auxiliary providers (`services`, `mappers`, `helpers`, `utils`) but must not bypass the layer contract.

### Trigger Layer
Allowed types:
|        Type       |       Description             |
|-------------------|-------------------------------|
| `httpController`  | Activated by HTTP requests    |
| `graphqlResolver` | Activated by GraphQL requests |
| `webSocketServer` | WebSocket connections         |
| `eventEmitter`    | Internal application events   |
| `cronJob`         | Scheduled job scheduler       |
| `queueConsumer`   | Message queue consumer        |

Responsibilities:
- Receive and validate entrypoint input.
- Delegate all business logic to `logic_provider`.
- Avoid business rules and persistence logic in this layer.

### Logic Provider Layer
Allowed types:
|      Type      |                          Description                      |
|----------------|-----------------------------------------------------------|
|   `usecase`    | Orchestrates business rules                               |
|   `cronTask`   | Actions executed after a scheduled cron fires             |
| `queueHandler` | Actions after consuming and deserializing a queue message |

Responsibilities:
- Orchestrate rules and coordinate auxiliary providers.
- Auxiliary providers allowed here: `services`, `mappers`, `helpers`, `utils`.
- Must not perform direct persistence or IO when a dedicated `data_provider` exists.

### Data Provider Layer
Allowed types:
|     Type     |                          Description                          |
|--------------|---------------------------------------------------------------|
| `repository` | Database access                                               |
| `dataClient` | Cache or data lake access                                     |
| `service`    | Wrapper for crypto libraries, dataClients, eventEmitter calls |
| `httpClient` | External service HTTP calls                                   |

Responsibilities:
- Encapsulate all IO and infrastructure concerns.
- Return stable contracts expected by upper layers.

## Code Quality (Hard Rules)
- Preserve data integrity during manipulation and persistence.
- Never mutate inputs and payload objects shared with other methods — create copies when needed.
- Avoid global mutable state or variables.
- Save complex or compound conditions in a named `boolean` variable before branching.
- Prefer `const` over `let`; only use `let` when reassignment is strictly necessary.
- Never bypass TypeScript type safety with `any`. If strictly necessary, use `unknown` and cast to the expected type with a documented reason.
- Do not bypass TypeScript types with `// @ts-ignore` without a documented reason.

## Naming Conventions (Hard Rules)
|         Context         |          Convention          |               Example                |
|-------------------------|------------------------------|--------------------------------------|
| Variables and functions | `camelCase`                  | `getUserById`, `isActive`            |
| Classes and interfaces  | `PascalCase`                 | `UserRepository`, `CreateUserDto`    |
|       Constants         | `SNAKE_CASE` (in UPPER_CASE) | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |

## Formatting and Lint
- All generated and modified code must pass Oxlint rules defined in `.oxlintrc.json`.
- Formatting must match Oxfmt (`.oxfmtrc.json`) and the EditorConfig rules in `.editorconfig` (tabs, single quotes, LF, 160 columns).
- Do not bypass lint rules with `// oxlint-disable` unless there is a documented reason.

## Implementation Checklist
- [ ] Layering follows `trigger -> logic_provider -> data_provider`.
- [ ] Each type belongs to its correct layer.
- [ ] No inputs or payload objects are mutated across method boundaries.
- [ ] No global mutable variables introduced.
- [ ] Complex conditions are extracted to named booleans.
- [ ] `const` is used wherever reassignment is not needed.
- [ ] Naming conventions (`camelCase`, `PascalCase`, `SNAKE_CASE`) are respected.
- [ ] Code passes Oxlint linting and Oxfmt formatting.
