import MasterController from '../app/utils/MasterController';
import RequestBuilder, { PayloadType } from '../app/utils/RequestBuilder';
import j2s from 'joi-to-swagger';
import * as fs from 'fs/promises';

export enum SwaggerMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
}

export interface ISwaggerDoc {
    tags: string[];
    summary: string;
    description: string;
}

interface Schema {
    type?: string;
    required?: string[];
    properties?: { [property: string]: Schema };
    format?: string;
    minimum?: number;
    example?: any;
    additionalProperties?: boolean | Schema;
}

interface Parameter {
    name: string;
    in: string;
    required: boolean;
    type?: string;
    format?: string;
    schema?: Schema;
}

interface Response {
    description: string;
    schema?: Schema;
}

interface Method {
    tags: string[];
    summary: string;
    description: string;
    operationId?: string;
    produces: string[];
    parameters?: Parameter[];
    responses: { [responseCode: string]: Response };
}

interface Path {
    get?: Method;
    post?: Method;
    put?: Method;
    delete?: Method;
    patch?: Method;
}

interface Paths {
    [path: string]: Path;
}

interface SecurityDefinition {
    type: string;
    name: string;
    in: string;
}

interface SwaggerDocument {
    swagger: string;
    info: {
        version: string;
        title: string;
        description: string;
    };
    schemes: string[];
    consumes: string[];
    produces: string[];
    securityDefinitions: { [securityDefinition: string]: SecurityDefinition };
    paths: Paths;
}

interface SwaggerConfigOptions {
    path: string;
    modify?: boolean;
}

class SwaggerConfig {
    private static swaggerDocument: SwaggerDocument;
    private static swaggerPath: string;
    private static swaggerModify: boolean | undefined;

    static initSwagger(options?: SwaggerConfigOptions) {
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

    private static swaggerDocsFromJoiSchema(validationRules: RequestBuilder) {
        const parameters: Parameter[] = [];

        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS) {
                const schema = payload.schema;
                const { swagger } = j2s(schema);
                for (const key in swagger.properties) {
                    const property = swagger.properties[key];
                    const parameter: Parameter = {
                        name: key,
                        in: 'path',
                        required: swagger.required.includes(key),
                        type: property.type,
                        format: property.format,
                    };
                    parameters.push(parameter);
                }
            } else if (payload.type === PayloadType.QUERY) {
                const schema = payload.schema;
                const { swagger } = j2s(schema);
                for (const key in swagger.properties) {
                    const property = swagger.properties[key];
                    const parameter: Parameter = {
                        name: key,
                        in: 'query',
                        required: swagger.required.includes(key),
                        type: property.type,
                        format: property.format,
                    };
                    parameters.push(parameter);
                }
            } else if (payload.type === PayloadType.BODY) {
                const schema = payload.schema;
                const { swagger } = j2s(schema);
                const parameter: Parameter = {
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

    static recordApi(path: string, method: SwaggerMethod, currentRef: typeof MasterController) {
        if (currentRef.doc() === false) {
            return;
        }
        const key = path.replace(/:(\w+)/g, '{$&}').replace(/:/g, '');
        const parameters = this.swaggerDocsFromJoiSchema(currentRef.validate());
        const paths: Paths = this.swaggerDocument.paths;
        const pathObj: Path = paths[key] || {};
        const methodObj: Method = pathObj[method] || {
            tags: [],
            summary: '',
            description: '',
            produces: ['application/json'],
            responses: this.exampleResponses(),
        };

        methodObj.parameters = parameters;
        methodObj.tags = (currentRef.doc() as ISwaggerDoc).tags;
        methodObj.summary = (currentRef.doc() as ISwaggerDoc).summary;
        methodObj.description = (currentRef.doc() as ISwaggerDoc).description;
        methodObj.operationId = currentRef.name;
        pathObj[method] = methodObj;
        paths[key] = pathObj;
        this.swaggerDocument.paths = paths;

        if (this.swaggerModify) {
            this.modifySwaggerDocument();
        }
    }

    private static modifySwaggerDocument() {
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

    private static exampleResponses() {
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

export default SwaggerConfig;
