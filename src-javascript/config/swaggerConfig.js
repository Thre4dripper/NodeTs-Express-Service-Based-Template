const { PayloadType } = require('../app/utils/RequestBuilder');
const j2s = require('joi-to-swagger');
const fs = require('fs').promises;

const SwaggerMethod = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    PATCH: 'patch',
};

class SwaggerConfig {
    static swaggerDocument;
    static swaggerPath;
    static swaggerModify;

    static initSwagger(options) {
        if (options) {
            const { path, modify } = options;
            this.swaggerPath = path;
            this.swaggerModify = modify;
            this.swaggerDocument = require(path);
            this.swaggerDocument.paths = {};
            if (this.swaggerModify) {
                this.modifySwaggerDocument();
            }
        } else {
            this.swaggerDocument = {
                swagger: '2.0',
                info: {
                    version: '1.0.0',
                    title: 'Node Swagger API',
                    description: 'Demonstrating how to describe a RESTful API with Swagger',
                },
                schemes: ['http', 'https'],
                consumes: ['application/json'],
                produces: ['application/json'],
                securityDefinitions: {
                    token: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header',
                    },
                },
                paths: {},
            };
        }
    }

    static getSwaggerDocument() {
        return this.swaggerDocument;
    }

    static swaggerDocsFromJoiSchema(validationRules) {
        let parameters = [];
        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS || payload.type === PayloadType.QUERY) {
                const schema = payload.schema;
                const { swagger } = j2s(schema);
                for (const key in swagger.properties) {
                    const property = swagger.properties[key];
                    const parameter = {
                        name: key,
                        in: payload.type === PayloadType.PARAMS ? 'path' : 'query',
                        required: swagger.required.includes(key),
                        type: property.type,
                        format: property.format,
                    };
                    parameters.push(parameter);
                }
            } else if (payload.type === PayloadType.BODY) {
                const schema = payload.schema;
                const { swagger } = j2s(schema);
                const parameter = {
                    name: 'body',
                    in: 'body',
                    required: true,
                    schema: swagger,
                };
                parameters.push(parameter);
            }
        });
        return parameters;
    }

    static recordApi(path, method, currentRef) {
        const key = path.replace(/:(\w+)/g, '{$&}').replace(/:/g, '');
        const parameters = this.swaggerDocsFromJoiSchema(currentRef.validate());
        const paths = this.swaggerDocument.paths;
        const pathObj = paths[key] || {};
        const methodObj = pathObj[method] || {
            tags: [],
            summary: '',
            description: '',
            produces: ['application/json'],
            responses: this.exampleResponses(),
        };
        methodObj.parameters = parameters;
        methodObj.tags = currentRef.doc().tags;
        methodObj.summary = currentRef.doc().summary;
        methodObj.description = currentRef.doc().description;
        methodObj.operationId = currentRef.name;
        pathObj[method] = methodObj;
        paths[key] = pathObj;
        this.swaggerDocument.paths = paths;
        if (this.swaggerModify) {
            this.modifySwaggerDocument();
        }
    }

    static modifySwaggerDocument() {
        fs.writeFile(this.swaggerPath, JSON.stringify(this.swaggerDocument, null, 2), {
            flag: 'w',
        })
            .then(() => {
                console.log('Swagger document updated');
            })
            .catch((err) => {
                console.log('Error updating swagger document', err);
            });
    }

    static exampleResponses() {
        return {
            200: {
                description: 'OK',
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success',
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                            example: 'Success',
                        },
                    },
                },
            },
            400: {
                description: 'Bad Request',
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error',
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                            example: 'Bad Request',
                        },
                        errors: {
                            type: 'object',
                        },
                    },
                },
            },
            404: {
                description: 'Not Found',
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error',
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                            example: 'Not Found',
                        },
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error',
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                            example: 'Internal Server Error',
                        },
                    },
                },
            },
        };
    }
}

module.exports.SwaggerMethod = SwaggerMethod;
module.exports.default = SwaggerConfig;
