import MasterController from '../app/utils/MasterController'
import RequestBuilder, { PayloadType } from '../app/utils/RequestBuilder'
import j2s from 'joi-to-swagger'

export enum SwaggerMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
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


class SwaggerConfig {
    private static swaggerDocument: SwaggerDocument

    static initSwagger(swaggerDocument: SwaggerDocument) {
        this.swaggerDocument = swaggerDocument
    }

    static getSwaggerDocument() {
        return this.swaggerDocument
    }

    private static swaggerDocsFromJoiSchema(validationRules: RequestBuilder) {
        let parameters: Parameter[] = []

        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS) {
                const schema = payload.schema
                const { swagger } = j2s(schema)
                for (const key in swagger.properties) {
                    const property = swagger.properties[key]
                    const parameter: Parameter = {
                        name: key,
                        in: 'path',
                        required: swagger.required.includes(key),
                        type: property.type,
                        format: property.format,
                    }
                    parameters.push(parameter)
                }
            } else if (payload.type === PayloadType.QUERY) {
                const schema = payload.schema
                const { swagger } = j2s(schema)
                for (const key in swagger.properties) {
                    const property = swagger.properties[key]
                    const parameter: Parameter = {
                        name: key,
                        in: 'query',
                        required: swagger.required.includes(key),
                        type: property.type,
                        format: property.format,
                    }
                    parameters.push(parameter)
                }
            } else if (payload.type === PayloadType.BODY) {
                const schema = payload.schema
                const { swagger } = j2s(schema)
                const parameter: Parameter = {
                    name: 'body',
                    in: 'body',
                    required: true,
                    schema: swagger,
                }
                parameters.push(parameter)
            }
        })

        return parameters
    }

    static recordApi(path: string, method: SwaggerMethod, currentRef: typeof MasterController) {
        const key = path.replace(/:(\w+)/g, '{$&}').replace(/:/g, '')
        const parameters = this.swaggerDocsFromJoiSchema(currentRef.validate())
        const paths: Paths = this.swaggerDocument.paths
        const pathObj: Path = paths[key] || {}
        const methodObj: Method = pathObj[method] || {
            tags: [],
            summary: '',
            description: '',
            produces: ['application/json'],
            responses: this.exampleResponses(),
        }

        methodObj.parameters = parameters
        methodObj.tags = currentRef.doc().tags
        methodObj.summary = currentRef.doc().summary
        methodObj.description = currentRef.doc().description
        methodObj.operationId = currentRef.name
        pathObj[method] = methodObj
        paths[key] = pathObj
        this.swaggerDocument.paths = paths
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
        }
    }
}

export default SwaggerConfig