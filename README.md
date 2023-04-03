# Node DDD Back-End Boilerplate (TypeScript)

## Description

Node.js Domain-Driven Design Boilerplate with TypeScript for Back-End.

## Overview

#### What to do if the service goes down

- Check the logs;
- Identify the problem;
- Test the dependencies and execution locally;
- If necessary, merge with a hotfix on git;
- Rebuild the project and restart the service;

## Architecture

[Back-End Architecture](google.com.br)  
[DataBase Diagram](https://dbdiagram.io/d/6338e5857b3d2034ff03a8c4)  

## Main technologies

- Express: Robust tooling for HTTP servers.
- AWS-SDK: A Node.js SDK to access AWS resources, such as:
  - SQS: Queue management service;
  - SNS: Topic notification service;
  - S3: Files storage service;
  - Cognito: Users authenticator service;
- Sequelize: ORM for MySQL database.
- MySQL: Relational database.
- Redis: Cache and in-memory key-value NoSQL database.
- Docker: Services isolation and process resources management with containers.
- Winston: Custom logger with transports.
- Morgan: HTTP request logger middleware used with winston.
- Joi: Schema validator library.
- Structure: A simple schema/attributes library, used for defining domain attributes.
- Eslint: JavaScript linter.
- Jest: Testing Framework.
- Huksy: Git hook-listenner used to format the code and the commits.

### Install dependencies

1. Install project dependencies  
```shell
$ yarn install
```

2. Copy dotenv file  
```shell
$ cp env/.env.development.local ./.env
$ source ./.env
```
3. Install AWS CLI  
[AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

4. Configure AWS CLI
```shell
$ aws configure
> AWS Access Key ID [****]: mock
> AWS Secret Access Key [****]: mock
> Default region name [us-east-1]: us-east-1
> Default output format [json]: table
```

## Environment Preparation

Access the project root folder (with the `Dockerfile`) and run the following commands:

```shell
$ docker build . -t <service_name>:1
$ docker images | grep <service_name>
$ docker run -ti <service_name>:1
```

And initialize the composefile (`docker-compose.yml`) available on project root folder.

```shell
$ docker-compose up -d # create and run all docker containers in background
```

## Running Locally

```shell
$ yarn migrate # create database entities
$ yarn seed # populate database registers
$ yarn mock-dependencies # create messages queue and started external services mock
$ yarn dev # start service
$ yarn receive-messages # create websocket client and start connection
$ yarn send-message # send message to queue
```

### Execution Checklist

- [x] Started Docker containers;
- [x] Created database entities;
- [x] Mocked external services;
- [x] Started HTTP REST API;
- [x] Started TCP WebSocket;
- [x] Sended message to Queue;

## Interface

- [localhost:3000](`http://localhost:3000/`) - Node Application
  * `/` - WebSocket Root Endpoint
  * `/api` - API Root Endpoint
  * `/api/docs` - API Documentation
- [localhost:9000](`http://localhost:9000/`) - SonarQube Page

