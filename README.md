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
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=Docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=flat-square&logo=Swagger&logoColor=white)
![CronJobs](https://img.shields.io/badge/-CronJobs-00FFFF?style=flat-square)

A fully configurable Node.js, Express, and TypeScript server template with a service-based architecture
that can interact with MySQL, PostgresSQL, Sqlite, MariaDB, MSSql, DB2, Snowflake, Oracle, MongoDB.
Out-of-the-box validation, documentation generation, and
more.

## Features

- **Node.js, Express, TypeScript**: Robust server setup using Node.js, Express, and TypeScript.
- **Sequelize**: Integration with Sequelize for SQL database operations.
- **Mongoose**: Integration with Mongoose for MongoDB database operations.
- **Database Compatibility**: Interact with MySQL, PostgreSQL, MariaDB, Sqlite, MSSql, MongoDB.
- **Validation Mechanism**: Pre-built validations for request payloads.
- **Automated Swagger Documentation**: Automatically generated documentation available at `/api-docs`.
- **Service-Based Architecture**: Modular approach for better organization and scalability.
- **Socket Events**: Socket event handling using Socket.io.
- **Docker**: Dockerized for easy deployment.
- **Cron Jobs**: Schedule tasks using cron jobs.

## Modules

### Automated Swagger Docs

- Swagger documentation auto-generated for all routes.
- Accessible at `/api-docs`.
- Generated using the `doc` method in the `MasterController` class and Joi validation schemas.

### MasterController (Heart of the application)

The `MasterController` is the backbone, providing functionalities for managing HTTP requests, socket events, payload
validation, and more.

#### Features

- **Controller Logic Handling**: `restController` method manages HTTP requests.
- **Socket Event Handling**: `socketController` method manages socket events.
- **Cron Job Scheduling**: `cronController` method schedules cron jobs.
- **Payload Validation**: `joiValidator` method validates incoming request payloads.
- **Swagger Documentation Generation**: `doc` method generates Swagger documentation.
- **Route Handling**: `get`, `post`, `put`, and `delete` methods register routes within the Express router.

#### Usage

Extend the `MasterController` to create controller classes for specific routes or socket events. Use the provided
methods for efficient request handling, validation, and documentation generation.

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
> $ git clone https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template
> ```
> #### Install dependencies
>
> ```bash
> $ npm install or yarn
> ```
>
> #### Start the server
>
> ```bash
> $ npm run dev or yarn dev
> ```
>
> #### Build the project
>
> ```bash
> $ npm run build or yarn build
> ```
>
> #### Run the project
>
> ```bash
> $ npm run start or yarn start
> ```

### Database Setup

> Additional dependencies are required for database operations. Install the appropriate dependencies for your database
> dialect.
>
> #### MySQL
>
> ```bash
> $ npm install mysql2
> ```
>
> #### PostgreSQL
>
> ```bash
> $ npm install pg pg-hstore
> ```
>
> #### Sqlite
>
> ```bash
> $ npm install sqlite
> ```
>
> #### MariaDB
>
> ```bash
> $ npm install mariadb
> ```
>
> #### MSSql
>
> ```bash
> $ npm install tedious or mssql
> ```
>
> #### DB2
>
> ```bash
> $ npm install ibm_db
> ```
>
> #### Snowflake
>
> ```bash
> $ npm install snowflake-sdk
> ```
>
> #### Oracle
>
> ```bash
> $ npm install oracledb
> ```
>
> #### MongoDB
>
> ```bash
> $ npm install mongoose
> ```

## Creating APIs

### Controller

```typescript
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
            }),
        );

        // request query validation
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().required(),
                offset: Joi.number().required(),
            }),
        );

        // request params validation
        payload.addToParams(
            Joi.object().keys({
                id: Joi.number().required(),
            }),
        );
        return payload;
    }

    // controller function
    async restController(
        params: IParams,
        query: IQuery,
        body: IBody,
        headers: any,
        allData: any): Promise<ResponseBuilder> {
        // your code here
        return new ResponseBuilder(200, Response, 'Success Message');
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

### Router File

```typescript
import express from 'express'
import Controller from '../Controller'

export default (app: express.Application) => {
    // REST Routes
    Controller.get(app, '/user/:id', [
        /* Comma separated middlewares */
    ])
    Controller.post(app, '/user/:id', [
        /* Comma separated middlewares */
    ])
    Controller.put(app, '/user/:id', [
        /* Comma separated middlewares */
    ])
    Controller.delete(app, '/user/:id', [
        /* Comma separated middlewares */
    ])
    Controller.patch(app, '/user/:id', [
        /* Comma separated middlewares */
    ])

    // Socket Events
    // Any payload you send from the client to this event will be available in the socketController function
    Controller.socketIO('Event Name')
}
```

> **Important**: Make sure to name your router file as `*.routes.ts` or `*.routes.js`

> **Note:** You don't need to import your router file to anywhere,
> put it in the routes directory, and it will be automatically
> taken care by the package.

### Cron File

```typescript
class DemoCron extends MasterController<null, null, null> {
    cronController() {
        console.log('Cron job is running');
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
    .dayOfMonth(CronMonth.January)
    .every()
    .dayOfWeek(CronWeekday.Friday)
    .build(),
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
> - `DB_DIALECT` - Database dialect to use. (Options: mysql, postgres, mariadb, sqlite, mssql, mongodb)
> - `DB_HOST` - Database host.
> - `DB_PORT` - Database port.
> - `DB_USER` - Database username.
> - `DB_PASS` - Database password.
> - `DB_NAME` - Database name.
> - `MONGO_URI` - MongoDB URI (Only for MongoDB Dialect).
> - `JWT_SECRET` - Secret key for JWT.
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
