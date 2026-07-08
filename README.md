# NodeTs-Express-Service-Based-Template

![Node](https://img.shields.io/badge/-Node-339933?style=flat-square&logo=Node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=TypeScript&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=Express&logoColor=white)
![Sequelize](https://img.shields.io/badge/-Sequelize-52B0E7?style=flat-square&logo=Sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white)
![PostgresSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=PostgreSQL&logoColor=white)
![Sqlite](https://img.shields.io/badge/-Sqlite-003B57?style=flat-square&logo=Sqlite&logoColor=white)
![MariaDB](https://img.shields.io/badge/-MariaDB-003545?style=flat-square&logo=MariaDB&logoColor=white)
![MSSql](https://img.shields.io/badge/-MSSql-CC2927?style=flat-square&logo=Microsoft-SQL-Server&logoColor=white)
![DB2](https://img.shields.io/badge/-DB2-CC0000?style=flat-square&logo=IBM&logoColor=white)
![Snowflake](https://img.shields.io/badge/-Snowflake-00BFFF?style=flat-square&logo=Snowflake&logoColor=white)
![Oracle](https://img.shields.io/badge/-Oracle-F80000?style=flat-square&logo=Oracle&logoColor=white)
![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square&logo=Mongoose&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white)
![Validations](https://img.shields.io/badge/-Validations-FF0000?style=flat-square)
![Socket](https://img.shields.io/badge/-Socket-FF6900?style=flat-square&logo=Socket.io&logoColor=white)
![gRPC](https://img.shields.io/badge/-gRPC-244c5a?style=flat-square)
![Redis](https://img.shields.io/badge/-Redis-DC382D?style=flat-square&logo=Redis&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=Docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=flat-square&logo=Swagger&logoColor=white)
![CronJobs](https://img.shields.io/badge/-CronJobs-00FFFF?style=flat-square)

A configurable Node.js service template with TypeScript and JavaScript trees, Express REST APIs,
Socket.IO events, cron jobs, Redis clients, and gRPC server/client support. It is designed for
service-based backends that can run against SQL databases through Sequelize or MongoDB through
Mongoose, with validation, Swagger documentation, structured logging, and generated gRPC types.

## Features

- **Node.js, Express, TypeScript**: Robust server setup using Node.js, Express, and TypeScript.
- **Sequelize**: Integration with Sequelize for SQL database operations.
- **Mongoose**: Integration with Mongoose for MongoDB database operations.
- **Database Compatibility**: Interact with MySQL, PostgreSQL, MariaDB, Sqlite, MSSql, MongoDB.
- **Validation Mechanism**: Pre-built validations for request payloads.
- **Automated Swagger Documentation**: Automatically generated documentation available at `/api-docs`.
- **gRPC Server + Client Helpers**: Local protos, generated TypeScript types, health checks, reflection, and reusable client caching.
- **Redis Clients**: Named lazy Redis clients for cache/session workloads with graceful shutdown.
- **Service-Based Architecture**: Modular approach for better organization and scalability.
- **Socket Events**: Socket modules self-register events from `app/sockets`.
- **Docker**: Dockerized for easy deployment.
- **Cron Jobs**: Cron modules self-register jobs from `app/crons`.
- **Structured Logging**: Pino logger with pretty development output and JSON production output.

## Project Layout

Both source trees expose the same application shape. The TypeScript tree includes generated proto
types; the JavaScript tree loads proto files at runtime.

```text
src-typescript/
    server.ts                         # HTTP, Socket.IO, cron, Redis, and gRPC bootstrap
    app/
        apis/                           # REST + gRPC controllers, repositories, services
        common/
            grpc.client.ts                # Generic remote gRPC client helper
            redis.client.ts               # Named Redis clients and lifecycle helpers
        crons/*.cron.ts                 # Auto-loaded cron modules
        grpc/*.grpc.ts                  # Auto-loaded gRPC service modules
        middlewares/                    # REST + gRPC auth/token middleware
        routes/*.routes.ts              # Auto-loaded REST route modules
        sockets/*.socket.ts             # Auto-loaded Socket.IO event modules
        utils/                          # MasterController, builders, logger, gRPC client factory
    config/
        grpcConfig.ts                   # gRPC server, route loader, health, reflection
        redisConfig.ts                  # Redis host/TLS/password/client config
        socketConfig.ts                 # Socket.IO init + module loader
        cronConfig.ts                   # Cron module loader + scheduler
    proto/
        shared/*.proto                  # Shared messages + health contract
        user/*.proto                    # Demo user RPC contract
        generated/                      # ts-proto output, git-ignored
```

JavaScript mirrors live in `src-javascript/` with the same directory names and `.js` extensions.

## Modules

### Automated Swagger Docs

- Swagger documentation auto-generated for all routes.
- Accessible at `/api-docs`.
- Generated using the `doc` method in the `MasterController` class and Joi validation schemas.

### MasterController (Heart of the application)

The `MasterController` is the backbone, providing functionality for REST requests, gRPC handlers,
Socket.IO events, cron jobs, payload validation, and Swagger documentation.

#### Features

- **Controller Logic Handling**: `restController` method manages HTTP requests.
- **gRPC Handling**: `grpcController` plus the static `rpc()` facade manage unary and streaming gRPC methods.
- **Socket Event Handling**: `socketController` method manages socket events.
- **Cron Job Scheduling**: `cronController` method schedules cron jobs.
- **Payload Validation**: `RequestBuilder` validates REST body/query/path data and gRPC payloads.
- **Swagger Documentation Generation**: `doc` method generates Swagger documentation.
- **Route Handling**: `get`, `post`, `put`, and `delete` methods register routes within the Express router.

#### Usage

Extend the `MasterController` to create controller classes for REST, gRPC, socket, or cron work. Use
the provided static registration methods so each transport can be auto-loaded from its own module
directory.

### gRPC

gRPC is bootstrapped from `src-typescript/config/grpcConfig.ts` and
`src-javascript/config/grpcConfig.js`.

- Service modules live in `app/grpc` and must be named `*.grpc.ts` or `*.grpc.js`.
- Protos live in `src-typescript/proto`; keep `.proto` files committed and generated output ignored.
- TypeScript stubs are generated into `src-typescript/proto/generated` with `pnpm proto:build-ts`.
- `pnpm build` runs `proto:build-ts` before compiling TypeScript.
- The JS tree uses `@grpc/proto-loader` at runtime and does not require generated JS stubs.
- Health checks are always enabled from `proto/shared/health.proto`.
- gRPC reflection is enabled in development-like environments (`development`, `dev`, `local`).
- Remote service consumers should use `app/common/grpc.client.ts` or `.js`, backed by `GrpcClientFactory` for cached clients and normalized errors.

### Redis

Redis is configured in `config/redisConfig.ts` and `config/redisConfig.js`, then exposed from
`app/common/redis.client.ts` and `app/common/redis.client.js`.

- `cacheClient` uses Redis DB `0` for cache-like workloads.
- `sessionClient` uses Redis DB `1` for session-like workloads.
- `redisConnect()` is called during server bootstrap after the database connection succeeds.
- `redisDisconnect()` is called during graceful shutdown.
- `REDIS_ADDRESS`, `REDIS_PASSWORD`, and `REDIS_TLS` control the connection.

### Socket.IO

Sockets are initialized from `config/socketConfig.ts` and `config/socketConfig.js`.

- Socket modules live in `app/sockets` and must be named `*.socket.ts` or `*.socket.js`.
- Each module imports a controller and calls `Controller.socketIO('event-name')`.
- `SocketConfig.InitSocketModules()` recursively loads socket modules at startup.
- `socketController(io, socket, payload)` handles incoming event payloads.

### Cron Jobs

Cron jobs are initialized from `config/cronConfig.ts` and `config/cronConfig.js`.

- Cron modules live in `app/crons` and must be named `*.cron.ts` or `*.cron.js`.
- Each module calls `Controller.cronJob(pattern)` with a crontab string or `CronBuilder` output.
- `CronConfig.InitCronJobs()` recursively loads cron modules at startup.
- `CronConfig.startCronJobs()` registers and starts all collected cron jobs.

## Installation

### Automated (CLI Tool)

> Easily initialize a Node.js server project with custom configurations using our CLI tool:
>
> ```bash
> npx node-server-init <folder-name>
> ```
>
> If you want to use the current directory as the project folder, run the following command:
>
> ```bash
> npx node-server-init .
> ```
>
> For more information, visit the [CLI Tool](https://www.npmjs.com/package/node-server-init) page or
> the [GitHub](https://github.com/Thre4dripper/node-server-init) repository.

### Manual

> #### Clone this repo to your local machine using `
>
> ```bash
> git clone https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template
> ```
>
> #### Install dependencies
>
> ```bash
> pnpm install
> ```
>
> #### Generate gRPC TypeScript stubs
>
> ```bash
> pnpm proto:build-ts
> ```
>
> #### Start the TypeScript server
>
> ```bash
> pnpm dev-ts
> ```
>
> #### Start the JavaScript server
>
> ```bash
> pnpm dev-js
> ```
>
> #### Build the TypeScript project
>
> ```bash
> pnpm build
> ```
>
> #### Run compiled output
>
> ```bash
> pnpm preview
> ```

### Database Setup

> Additional dependencies are required for database operations. Install the appropriate dependencies for your database
> dialect.
>
> #### MySQL
>
> ```bash
> pnpm add mysql2
> ```
>
> #### PostgreSQL
>
> ```bash
> pnpm add pg pg-hstore
> ```
>
> #### Sqlite
>
> ```bash
> pnpm add sqlite3
> ```
>
> #### MariaDB
>
> ```bash
> pnpm add mariadb
> ```
>
> #### MSSql
>
> ```bash
> pnpm add tedious
> ```
>
> #### DB2
>
> ```bash
> pnpm add ibm_db
> ```
>
> #### Snowflake
>
> ```bash
> pnpm add snowflake-sdk
> ```
>
> #### Oracle
>
> ```bash
> pnpm add oracledb
> ```
>
> #### MongoDB
>
> ```bash
> pnpm add mongoose
> ```

## Creating APIs

### Controller

```typescript
import Joi from 'joi';
import MasterController from './app/utils/MasterController';
import RequestBuilder from './app/utils/RequestBuilder';
import ResponseBuilder from './app/utils/ResponseBuilder';
import { StatusCodes } from './app/enums/StatusCodes';
import { RegisterUserResponse } from './proto/generated/user/user';

class Controller extends MasterController<IParams, IQuery, IBody> {
    // swagger documetation for the api
    static doc() {
        return {
            tags: ['User'],
            summary: 'Register User',
            description: 'Register User',
        };
    }

    // add your validations here,
    // rest of the swagger documentation will be generated automatically from the validation
    public static validate(): RequestBuilder {
        const payload = new RequestBuilder();

        // request body validation
        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            })
        );

        // gRPC payload validation can reuse the same Joi schema shape.
        payload.addToGrpcPayload(
            Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(8).max(20).required(),
            })
        );

        // request query validation
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().required(),
                offset: Joi.number().required(),
            })
        );

        // request params validation
        payload.addToPath(
            Joi.object().keys({
                id: Joi.number().required(),
            })
        );
        return payload;
    }

    // controller function
    async restController(
        params: IParams,
        query: IQuery,
        body: IBody,
        headers: any,
        allData: any
    ): Promise<ResponseBuilder> {
        // your code here
        return new ResponseBuilder(200, Response, 'Success Message');
    }

    // gRPC controller function
    async grpcController(payload: IBody): Promise<ResponseBuilder> {
        const grpcResponse: RegisterUserResponse = {
            user: {
                id: '1',
                name: payload.name,
                email: payload.email,
            },
            message: 'User created',
        };

        const response = new ResponseBuilder(StatusCodes.CREATED, grpcResponse, 'User created');
        return response;
    }

    // socket controller function
    socketController(io: Server, socket: Socket, payload: any): void {
        // your code here
        // Socket data will be available in payload, recieved from the client on socket event, which is setup in the route file
        // You can emit data back to the client using io.emit or socket.emit
    }

    // cron controller function
    cronController(): void {
        // your scheduled code here (if any)
    }
}

export default Controller;
```

#### Controller Generics

- **IParams:** Request params interface/type
- **IQuery:** Request query interface/type
- **IBody:** Request body interface/type

#### restController Parameters

- **params:** Request params (eg. /user/:id)
- **query:** Request query (eg. /user?limit=10&offset=0)
- **body:** Request body
- **headers:** Request headers
- **allData:** All request data (all the above-combined + custom data from middlewares)

#### socketController Parameters

- **io:** Socket.io instance
- **socket:** Socket instance
- **payload:** Data sent from the client

#### grpcController Parameters

- **payload:** Validated gRPC request payload from the proto method.

For TypeScript gRPC responses, type the data object with the generated proto response type before
wrapping it in `ResponseBuilder`. This makes the proto contract enforce the controller response
shape at compile time.

### Router File

```typescript
import express from 'express';
import Controller from '../Controller';

export default (app: express.Application) => {
    // REST Routes
    Controller.get(app, '/user/:id', [
        /* Comma separated middlewares */
    ]);
    Controller.post(app, '/user/:id', [
        /* Comma separated middlewares */
    ]);
    Controller.put(app, '/user/:id', [
        /* Comma separated middlewares */
    ]);
    Controller.delete(app, '/user/:id', [
        /* Comma separated middlewares */
    ]);
    Controller.patch(app, '/user/:id', [
        /* Comma separated middlewares */
    ]);
};
```

> **Important**: Make sure to name your router file as `*.routes.ts` or `*.routes.js`

> **Note:** You don't need to import your router file to anywhere,
> put it in the routes directory, and it will be automatically
> taken care by the package.

### gRPC Service File

```typescript
import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../config/grpcConfig';
import RegisterUserController from '../apis/user/controllers/register.user.controller';

export default (server: grpc.Server) => {
    const proto = loadProto('user/user.proto') as any;
    const userService = proto.user.UserRpc.service;

    server.addService(userService, {
        register: RegisterUserController.rpc([]),
    });
};
```

> **Important**: Make sure to name your gRPC module as `*.grpc.ts` or `*.grpc.js` and place it in
> `app/grpc`.

### Remote gRPC Client

```typescript
import getRpcClient from '../../common/grpc.client';
import { GrpcClientFactory } from '../../utils/GrpcClientFactory';
import { UserRpcClient } from '../../../proto/generated/user/user';

const client = getRpcClient('userService', UserRpcClient, 'REMOTE_SERVICE_GRPC_ADDRESS');
const result = await GrpcClientFactory.unary(client, 'register', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
});
```

> **Note:** `REMOTE_SERVICE_GRPC_ADDRESS` is only an example env var. Pass any env var name that
> points to the remote service address.

### Socket File

```typescript
import RegisterUserController from '../apis/user/controllers/register.user.controller';

RegisterUserController.socketIO('hello');
```

> **Important**: Make sure to name your socket module as `*.socket.ts` or `*.socket.js` and place it
> in `app/sockets`.

### Cron File

```typescript
import MasterController from '../utils/MasterController';
import CronBuilder from '../utils/CronBuilder';
import { CronWeekday } from '../enums/CronJob';
import { createLogger } from '../utils/Logger';

const log = createLogger('cron');

class DemoCron extends MasterController<null, null, null> {
    cronController() {
        log.info('Cron job is running');
    }
}

// Unix Crontab format
DemoCron.cronJob('*/5 * * * * *');

// Using CronBuilder
DemoCron.cronJob(
    new CronBuilder()
        .every()
        .second()
        .every()
        .specificMinute([10, 20, 30])
        .every()
        .dayOfMonth()
        .every()
        .dayOfWeek(CronWeekday.Friday)
        .build()
);
```

> **Important**: Make sure to name your cron file as `*.cron.ts` or `*.cron.js`

> **Note:** You don't need to import your cron file to anywhere,
> put it in cron directory, and it will be automatically
> taken care by the package.

## Docker

> #### Docker Environment variables
>
> - `PORT` - Port number for the server to run on.
> - `GRPC_PORT` - Port number for the gRPC server to run on.
> - `DB_DIALECT` - Database dialect to use. (Options: mysql, postgres, mariadb, sqlite, mssql, mongodb)
> - `DB_HOST` - Database host.
> - `DB_PORT` - Database port.
> - `DB_USER` - Database username.
> - `DB_PASS` - Database password.
> - `DB_NAME` - Database name.
> - `MONGO_URI` - MongoDB URI (Only for MongoDB Dialect).
> - `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`, `DB_SSL_CA_FILE` - Database TLS settings.
> - `REDIS_ADDRESS`, `REDIS_PASSWORD`, `REDIS_TLS` - Redis connection settings.
> - `JWT_PRIVATE_KEY` or `JWT_PRIVATE_KEY_PATH` - RS256 signing key input.
> - `LOG_LEVEL`, `LOG_TRANSPORT` - Pino logging settings.
> - `REMOTE_SERVICE_GRPC_ADDRESS` - Example remote gRPC service address for client helpers.
>
> #### Build the image
>
> ```bash
> $ docker build -t <image-name> .
> ```
>
> #### Run the container
>
> ```bash
> $ docker run -e <env-variable>=<value> -p <port>:<port> <image-name>
> ```
>
> #### Run the container in the background
>
> ```bash
> $ docker run -d -e <env-variable>=<value> -p <port>:<port> <image-name>
> ```
>
> #### Stop the container
>
> ```bash
> $ docker stop <container-id>
> ```
>
> #### Remove the container
>
> ```bash
> $ docker rm <container-id>
> ```
>
> #### Remove the image
>
> ```bash
> $ docker rmi <image-name>
> ```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
