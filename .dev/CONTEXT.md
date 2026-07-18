# Project Context

Node.js Back-End Boilerplate built with TypeScript and NestJS. This document centralizes the information needed to understand and work on the project.

---

## System Overview

Full reference: [`docs/system-overview.md`](../docs/system-overview.md)

### Main Technologies

| Technology | Role |
|---|---|
| **TypeScript / Node.js** | Runtime and language |
| **NestJS** | Back-end framework |
| **Fastify** | HTTP server adapter |
| **Socket.io** | WebSocket library |
| **Joi** | Schema validation |
| **AWS SDK** | SQS (queues), SNS (notifications), S3 (storage), Cognito (auth) |
| **TypeORM** | ORM — PostgreSQL and MongoDB |
| **PostgreSQL** | Relational (SQL) database |
| **MongoDB** | Document-oriented NoSQL database |
| **Redis** | Cache / in-memory key-value store |

## Execution

Full reference: [`docs/execution.md`](../docs/execution.md)

### Quick Start

```shell
npm install
cp envs/.env.local ./.env
source ./.env
docker-compose up -d cloud database data cache
npm run db:migration-run && npm run db:seed
npm run mock-dependencies
npm run start:dev
```

### Useful Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Start in development mode (watch) |
| `npm run db:migration-run` | Run TypeORM migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run mock-dependencies` | Create SQS/SNS queues and start mock services |
| `npm run receive-messages` | Start WebSocket client to receive events |
| `npm run send-message` | Send a test message to the queue |

---

## NestJS Framework

### Architecture — Hexagonal Layered Flow

All code must follow this strict execution order:

```
trigger → logic_provider → data_provider
```

Never skip layers. Never call `data_provider` directly from `trigger`.

#### Trigger Layer

Entry points that receive external input:

| Type | Description |
|---|---|
| `httpController` | HTTP request handler |
| `webSocketServer` | WebSocket connection handler |
| `eventEmitter` | Internal application event listener |
| `cronJob` | Scheduled job scheduler |
| `queueConsumer` | Message queue consumer |

Responsibilities: receive and validate input, delegate all business logic to `logic_provider`.

#### Logic Provider Layer

Orchestrators of business rules:

| Type | Description |
|---|---|
| `usecase` | Orchestrates business rules |
| `cronTask` | Actions executed after a scheduled cron fires |
| `queueHandler` | Actions after consuming and deserializing a queue message |

Auxiliary providers allowed here: `services`, `mappers`, `helpers`, `utils`.
Must not perform direct persistence or IO when a dedicated `data_provider` exists.

#### Data Provider Layer

Infrastructure and IO encapsulation:

| Type | Description |
|---|---|
| `repository` | Database access (TypeORM) |
| `dataClient` | Cache or data lake access (Redis, S3) |
| `service` | Wrapper for crypto libraries, dataClients, eventEmitter calls |
| `httpClient` | External service HTTP calls |

### NestJS Usage Rules

- Annotate providers with `@Injectable()`.
- Inject dependencies via constructor using `private readonly`.
- Use `@Module()` to declare providers, imports, and exports per module.
- Use NestJS `Test.createTestingModule` for unit tests — never plain class instantiation.
- Use `ExceptionFilter` and `HttpException` subclasses for error handling.
- Use `ValidationPipe` with `class-validator` for DTO validation at controller boundaries.
- Use `ConfigService` for environment variable access — never `process.env` directly.

### Code Quality Rules

- Never mutate payload objects shared across methods — create copies.
- No global mutable state.
- Extract complex conditions to named boolean variables.
- Prefer `const` over `let`.
- Naming conventions:
  - `camelCase` — variables and functions
  - `PascalCase` — classes and interfaces
  - `SNAKE_CASE` — constants (UPPER_CASE)
- All output must pass ESLint + Prettier as configured in the project.

---

## GraphQL

The application exposes a GraphQL endpoint at `/graphql`.

### Query Example — List Connections

```graphql
query {
  listConnections {
    databaseId
    subscriptionId
    clientId
    createdAt
    newConnectionsListen
  }
}
```

### Mutation Example — Create Connection

```graphql
mutation {
  createConnection(createConnectionInput: {
    subscriptionId: "xSFPA_XAuTtAB"
    clientId: "Alvaro#5"
    newConnectionsListen: true
  }) {
    databaseId
    subscriptionId
    clientId
    newConnectionsListen
    createdAt
  }
}
```

Use NestJS `@Resolver()`, `@Query()`, `@Mutation()`, and `@Args()` decorators from `@nestjs/graphql` for GraphQL endpoints. Input types use `@InputType()` and output types use `@ObjectType()`.

---

## Infrastructure (`infra/`)

The `infra/` directory contains all deployment and observability configuration:

| Path | Purpose |
|---|---|
| `infra/docker/` | Dockerfiles for production and development builds |
| `infra/kubernetes/` | Kubernetes manifests — namespace, deployment, service, secrets |
| `infra/backstage/` | BackStage catalog and API definition files |
| `infra/grafana.properties` | Grafana datasource and dashboard configuration |
| `infra/loki-config.yaml` | Loki log aggregation configuration |
| `infra/promtail-config.yaml` | Promtail log scraping configuration (feeds Loki) |

### Docker

- Local development uses `docker-compose.yml` at the project root.
- Production image is built from `infra/docker/Dockerfile.prod`.
- Compose services: `cloud` (AWS mocks via LocalStack), `database` (PostgreSQL), `data` (MongoDB), `cache` (Redis).

### Kubernetes

Manifests under `infra/kubernetes/`:
- `cluster/` — Kind cluster config for local development.
- `namespaces/` — `boilerplate-namespace`.
- `deployments/` — main application deployment.
- `services/` — LoadBalancer service exposing port 3000.
- `secrets/` — environment secrets (do not commit real values).

### Observability

- **Grafana** (`localhost:9002`) reads metrics and logs. Config at `infra/grafana.properties`.
- **Loki** aggregates logs from the application container.
- **Promtail** scrapes container stdout/stderr and ships to Loki. Config at `infra/promtail-config.yaml`.
- **Sentry** captures runtime errors and traces (configured via `SENTRY_DSN` env var).
