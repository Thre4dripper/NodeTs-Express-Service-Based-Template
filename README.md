# NodeTs-Express-Service-Based-Template

### Features

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

This repository contains a server application built with TypeScript and Socket.IO. It features a `MasterController` class that handles HTTP requests and socket events, and provides methods for validating request payloads and handling request and response. The server is built with Express.js and uses Sequelize for database operations. It also includes Swagger documentation for the controller classes. The project uses Yarn as a package manager and includes scripts for development, building, and running the server.

## Modules

### MasterController

The `MasterController` class is the cornerstone of this server application, offering extensive functionalities for managing HTTP requests, socket events, payload validation, and more.

#### Features

- **Controller Logic Handling**: The `restController` method manages the core logic for handling HTTP requests, allowing for customization and tailored responses based on received parameters, queries, body content, headers, and other middleware-generated data.

- **Socket Event Handling**: The `socketController` method facilitates the logic execution upon receiving socket events, providing a means to process incoming data from connected clients through Socket.IO.

- **Payload Validation**: The `joiValidator` method allows the validation of incoming request payloads based on provided validation rules. It checks and reports errors related to parameters, queries, and request body, ensuring data conformity as per defined schema.

- **Swagger Documentation Generation**: The `doc` method generates Swagger documentation for the respective controller classes, ensuring comprehensive and easily accessible API documentation.

- **Route Handling**: The `get`, `post`, `put`, and `delete` methods facilitate the registration of routes within the Express router, automatically recording API paths and methods for Swagger documentation and delegating request handling to `restController`.

#### Usage

The `MasterController` serves as the foundation for creating controller classes responsible for specific routes or socket events. By extending this class, developers can leverage its robust functionalities to craft controllers tailored to their application's needs, ensuring efficient request handling, validation, and documentation generation.

Utilize the provided methods to create and manage controllers, validate payloads, and generate Swagger documentation for clear API understanding and efficient development.

### Installation

#### Clone
> Clone this repo to your local machine using `
> ```bash
> $ git clone https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template
> ```


#### Setup
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

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.