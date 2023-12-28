# NodeTs-Express-Service-Based-Template

![Node](https://img.shields.io/badge/-Node-339933?style=flat-square&logo=Node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=TypeScript&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=Express&logoColor=white)
![Sequelize](https://img.shields.io/badge/-Sequelize-52B0E7?style=flat-square&logo=Sequelize&logoColor=white)
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white)
![PostgresSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=PostgreSQL&logoColor=white)
![Cassandra](https://img.shields.io/badge/-Cassandra-1287B1?style=flat-square&logo=Apache-Cassandra&logoColor=white)
![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square&logo=Mongoose&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white)
![Validations](https://img.shields.io/badge/-Validations-FF0000?style=flat-square)
![Socket](https://img.shields.io/badge/-Socket-FF6900?style=flat-square&logo=Socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=Docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=flat-square&logo=Swagger&logoColor=white)

A fully configured Node.js, Express, and TypeScript server template with a service-based architecture.
That can interact with MySQL, PostgresSQL, Cassandra, MongoDB.
Out-of-the-box validation, documentation generation, and
more.

## Modules

### MasterController (Heart of the application)

The `MasterController` is the backbone of this server application, providing functionalities for managing HTTP requests,
socket events, payload validation, and more.

#### Features

- **Controller Logic Handling**: `restController` method manages HTTP requests.
- **Socket Event Handling**: `socketController` method manages socket events.
- **Payload Validation**: `joiValidator` method validates incoming request payloads.
- **Swagger Documentation Generation**: `doc` method generates Swagger documentation.
- **Route Handling**: `get`, `post`, `put`, and `delete` methods register routes within the Express router.

#### Usage

Extend the `MasterController` to create controller classes for specific routes or socket events. Use the provided
methods for efficient request handling, validation, and documentation generation.

### Installation

#### Clone

> Clone this repo to your local machine using `
> ```bash
> $ git clone https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template
> ```

### Setup

> Install dependencies
> ```bash
> $ npm install or yarn
> ```
>
> Start the server
> ```bash
> $ npm run dev or yarn dev
> ```
>
> Build the project
> ```bash
> $ npm run build or yarn build
> ```
>
> Run the project
> ```bash
> $ npm run start or yarn start
> ```

### Docker

#### Build the image

```bash
$ docker build -t <image-name> .
```

#### Run the container

```bash
$ docker run -p <port>:<port> <image-name>
```

#### Run the container in background

```bash
$ docker run -d -p <port>:<port> <image-name>
```

#### Stop the container

```bash
$ docker stop <container-id>
```

#### Remove the container

```bash
$ docker rm <container-id>
```

#### Remove the image

```bash
$ docker rmi <image-name>
```

#### List all containers

```bash
$ docker ps -a
```

#### List all running containers

```bash
$ docker ps
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.