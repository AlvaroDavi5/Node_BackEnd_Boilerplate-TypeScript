# System Overview

Node.js Boilerplate for Back-End using TypeScript and Nest.js.

---

### Main technologies

- **JavaScript**: Web programming language;
- **TypeScript**: JavaScript superset for typing;
- **Node.js**: JavaScript runtime;
- **Nest.js**: TypeScript Framework for Back-End;
- **Express**: Robust tooling for HTTP servers;
- **Socket.io**: WebSocket library;
- **AWS-SDK**: A Node.js SDK to access AWS resources, such as:  
	> _SQS_: Queue management service;  
	> _SNS_: Topic notification service;  
	> _S3_: Files storage service;  
	> _Cognito_: Users authenticator service;  
- **TypeORM**: ORM for databases;
- **PostgreSQL**: Relational (SQL) database;
- **MongoDB**: Schematic and document-oriented NoSQL database;
- **Redis**: Cache and in-memory key-value NoSQL database;
- **Winston**: Custom logger with transports;
- **Joi**: Schema validator library;
- **Jest**: Testing Framework;
- **Docker**: Services isolation and process resources management with containers;
- **Kubernetes**: Containers orchestration system;
- **Grafana**: Containers data visualization and dashboards;
- **Sentry**: Errors capture, tracing and metrics;
- **SonarQube**: Test coverage and code quality analyzer;
- **ESLint**: JavaScript/TypeScript linter and formatter;
- **Lefthook**: Git hooks tool used to check tests, format the code and the commits;

### Interface

- [localhost:3000](http://localhost:3000/) - Application Interface (API)  
	* `/` - WebSocket Root Endpoint  
	* `/api` - REST Root Endpoint  
		- `/api/docs` - Swagger API Documentation (Page)  
		- `/api/docs.yml` - Swagger API Documentation (YAML)  
		- `/api/docs.json` - Swagger API Documentation (JSON)  
	* `/graphql` - GraphQL Endpoint  
- [localhost:4000](http://localhost:4000/) - Mocked Service Page  
- [localhost:8000](http://localhost:8000/) - Nest.js DevTools Page  
- [localhost:8080](http://localhost:8080/) - Adminer Page  
- [localhost:8081](http://localhost:8081/) - Mongo Express Page  
- [localhost:8082](http://localhost:8082/) - Redis Commander Page  
- [localhost:9000](http://localhost:9000/) - Jenkins Page  
- [localhost:9001](http://localhost:9001/) - SonarQube Page  
- [localhost:9002](http://localhost:9002/) - Grafana Page  
- [localhost:9003](http://localhost:9003/) - BackStage Page  
