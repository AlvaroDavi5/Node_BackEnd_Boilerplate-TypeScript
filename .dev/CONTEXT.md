# Project Context

Node.js Back-End Boilerplate built with TypeScript and NestJS. This document centralizes the information needed to understand and work on the project.

---

## System Overview

Full reference: [`docs/system-overview.md`](../docs/system-overview.md)

### Main Technologies

| Technology | Role |
| --- | --- |
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

Architecture rules, layer definitions, naming conventions, and code quality hard rules are defined in [`architecture-flow-and-code-style.instructions.md`](./instructions/architecture-flow-and-code-style.instructions.md).

The mandatory execution order is: `trigger → logic_provider → data_provider`.

### NestJS Usage Patterns

- Annotate providers with `@Injectable()`.
- Declare providers, imports, and exports per module with `@Module()`.
- Inject dependencies via constructor using `private readonly`.
- Use `ExceptionFilter` and `HttpException` subclasses for error handling — never throw raw `Error` from controllers.
- Use `ValidationPipe` with `class-validator` decorators for DTO validation at controller boundaries.
- Use `ConfigService` for environment variable access — never `process.env` directly.
- Use NestJS `Test.createTestingModule` for unit tests — never plain class instantiation.

---

## GraphQL

The application exposes a GraphQL endpoint at `/graphql`. Use `@Resolver()`, `@Query()`, `@Mutation()`, and `@Args()` decorators from `@nestjs/graphql`. Input types use `@InputType()` and output types use `@ObjectType()`.

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
