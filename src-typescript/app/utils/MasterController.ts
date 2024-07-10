import RequestBuilder, { PayloadType } from './RequestBuilder';
import { Request, RequestHandler, Response, Router } from 'express';
import asyncHandler from './AsyncHandler';
import SwaggerConfig, { ISwaggerDoc, SwaggerMethod } from '../../config/swaggerConfig';
import ResponseBuilder from './ResponseBuilder';
import { Server, Socket } from 'socket.io';

interface IJoiErrors {
    query?: string[];
    param?: string[];
    body?: string[];
}

interface ISocketClient {
    event: string;
    masterController: MasterController<null, null, null>;
}

/**
 * @class MasterController
 * @description This class is used to create a controller class
 * @summary extends this class to create a controller class for a route or socket event
 * and override the restController or socketController method
 * to write the controller logic for the route or socket event respectively
 */
class MasterController<P, Q, B> {
    // start socket requests snippet
    private static socketRequests: ISocketClient[] = [];

    /**
     * @method MasterController.getSocketRequests
     * @description This static method is used to retrieve all the socket requests instances for a controller class.
     *
     * @returns {ISocketClient[]} - Returns an array of ISocketClient objects, each representing a socket request instance
     */
    static getSocketRequests(): ISocketClient[] {
        return this.socketRequests;
    }

    // end socket requests snippet

    /**
     * @method MasterController.doc
     * @description This method is used to get the swagger doc for a controller class
     *
     * @example
     * {
     *    tags: ['User'],
     *    summary: 'Register User',
     *    description: 'Register User Description',
     * }
     * @returns {Object} swagger doc for a controller class {@link ISwaggerDoc}
     */
    static doc(): ISwaggerDoc | boolean {
        return {
            tags: [],
            summary: '',
            description: '',
        };
    }

    /**
     * @method MasterController.validate
     * @static
     * @description Creates a new RequestBuilder object configured for validating request payloads.
     * @returns {RequestBuilder} - RequestBuilder object configured for validation.
     * @example
     * // Create a payload validator using RequestBuilder
     * const payloadValidator = RequestBuilder.validate();
     * // Add validation rules to the payload validator
     * payloadValidator.addToBody(
     *    Joi.object().keys({
     *        email: Joi.string().email().required(),
     *        password: Joi.string().min(8).max(20).required(),
     *    })
     * );
     * payloadValidator.addToQuery(
     *    Joi.object().keys({
     *        limit: Joi.number().required(),
     *        offset: Joi.number().required(),
     *    })
     * );
     * payloadValidator.addToParams(
     *    Joi.object().keys({
     *        id: Joi.number().required(),
     *    })
     * );
     * // Return the configured payload validator for further usage
     * return payloadValidator;
     */
    static validate(): RequestBuilder {
        return new RequestBuilder();
    }

    /**
     * @method MasterController.restController
     * @description Handles the controller logic after validating the request payload.
     * @param params - Parameters from the request URL.
     * @param query - Query parameters from the request URL.
     * @param body - Body content from the request.
     * @param headers - Headers from the request.
     * @param allData - Contains all data including params, query, body, headers, and custom data from middlewares.
     * @protected This method is protected and can only be accessed by the child class.
     * @returns {Promise<any>} Promise resolving to any value representing the response.
     */
    async restController(
        params: P,
        query: Q,
        body: B,
        headers: any,
        allData: any
    ): Promise<ResponseBuilder> {
        // Controller logic goes here
        console.log(params, query, body, headers, allData);
        // Return a ResponseBuilder instance
        return new ResponseBuilder(200, null, 'Success');
    }

    /**
     * @method MasterController.socketController
     * @description Handles the logic for socket events.
     * @param io - Instance of the Socket.IO server.
     * @param socket - Socket instance representing the client connection.
     * @param payload - Payload data received from the client.
     * @protected This method is protected and can only be accessed by the child class.
     * @returns {any} Returns any value, usually the response or processing result.
     */
    socketController(io: Server, socket: Socket, payload: any): any {
        // Logic for handling socket events goes here
        console.log(io, socket, payload);
    }

    /**
     * @method MasterController.joiValidator
     * @description Validates the request payload based on provided validation rules.
     * @param {any} params - Parameters from the request URL.
     * @param {any} query - Query parameters from the request URL.
     * @param {any} body - Body content from the request.
     * @param {RequestBuilder} validationRules - Validation rules obtained from the validate method
     * (Joi validation rules are written in the validate method).
     * @private This method is private and can only be accessed by the MasterController class.
     * @returns {IJoiErrors | null} Returns an object containing any validation errors found, or null
     * if there are no errors.
     */
    private static joiValidator(
        params: any,
        query: any,
        body: any,
        validationRules: RequestBuilder
    ): IJoiErrors | null {
        // Check if there are no validation rules, return null (no validation needed)
        if (validationRules.get.length === 0) {
            return null;
        }

        // Object to store validation errors
        const joiErrors: IJoiErrors = {
            query: [],
            param: [],
            body: [],
        };

        // Loop through each payload type and validate the corresponding data
        validationRules.payload.forEach((payload) => {
            if (payload.type === PayloadType.PARAMS) {
                // Validate params based on schema
                const schema = payload.schema;
                const { error } = schema.validate(params, {
                    abortEarly: false,
                    allowUnknown: true,
                });
                if (error) {
                    // Push validation error messages to the respective array
                    joiErrors.param?.push(...error.details.map((err) => err.message));
                }
            } else if (payload.type === PayloadType.QUERY) {
                // Validate query based on schema
                const schema = payload.schema;
                const { error } = schema.validate(query, { abortEarly: false, allowUnknown: true });
                if (error) {
                    // Push validation error messages to the respective array
                    joiErrors.query?.push(...error.details.map((err) => err.message));
                }
            } else if (payload.type === PayloadType.BODY) {
                // Validate body based on schema
                const schema = payload.schema;
                const { error } = schema.validate(body, { abortEarly: false, allowUnknown: true });
                if (error) {
                    // Push validation error messages to the respective array
                    joiErrors.body?.push(...error.details.map((err) => err.message));
                }
            }
        });

        // Remove empty arrays from joiErrors
        if (joiErrors.query?.length === 0) delete joiErrors.query;
        if (joiErrors.param?.length === 0) delete joiErrors.param;
        if (joiErrors.body?.length === 0) delete joiErrors.body;

        // Return null if no errors, i.e. all arrays are removed above
        if (Object.keys(joiErrors).length === 0) return null;

        return joiErrors;
    }

    /**
     * @method MasterController.handler
     * @description Handles the request and response.
     * @private This method is private and can only be accessed by the MasterController class.
     * @returns {RequestHandler} Returns an Express RequestHandler function.
     */
    private static handler(): RequestHandler {
        // Using 'self' to access the class within the async function scope
        const self = this;

        // Returns an async function serving as a RequestHandler for Express
        return asyncHandler(async (req: Request, res: Response) => {
            // Create a new instance of the current class
            const controller = new self();

            // Combine all request data into a single object
            const allData = { ...req.params, ...req.query, ...req.body, ...req.headers, ...req };

            // Retrieve validation rules using 'validate' method
            const validationRules = this.validate();

            // Perform payload validation and capture any validation errors
            const joiErrors = this.joiValidator(req.params, req.query, req.body, validationRules);

            // If there are validation errors, respond with a 400 status and the error details
            if (joiErrors) {
                return res.status(400).json({
                    status: 400,
                    message: 'Validation Error',
                    data: null,
                    errors: joiErrors,
                });
            }

            // Invoke the 'restController' method to handle the request and get the response
            const { response } = await controller.restController(
                req.params,
                req.query,
                req.body,
                req.headers,
                allData
            );

            // Respond with the status and data from 'restController' method
            res.status(response.status).json(response);
        });
    }

    /**
     * @method MasterController.get
     * @description Registers a GET route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered GET route.
     */
    static get(router: Router, path: string, middlewares: RequestHandler[]): Router {
        SwaggerConfig.recordApi(path, SwaggerMethod.GET, this);
        return router.get(path, ...middlewares, this.handler());
    }

    /**
     * @method MasterController.post
     * @description Registers a POST route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered POST route.
     */
    static post(router: Router, path: string, middlewares: RequestHandler[]): Router {
        SwaggerConfig.recordApi(path, SwaggerMethod.POST, this);
        return router.post(path, ...middlewares, this.handler());
    }

    /**
     * @method MasterController.put
     * @description Registers a PUT route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered PUT route.
     */
    static put(router: Router, path: string, middlewares: RequestHandler[]): Router {
        SwaggerConfig.recordApi(path, SwaggerMethod.PUT, this);
        return router.put(path, ...middlewares, this.handler());
    }

    /**
     * @method MasterController.delete
     * @description Registers a DELETE route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered DELETE route.
     */
    static delete(router: Router, path: string, middlewares: RequestHandler[]): Router {
        SwaggerConfig.recordApi(path, SwaggerMethod.DELETE, this);
        return router.delete(path, ...middlewares, this.handler());
    }

    /**
     * @method MasterController.patch
     * @description Registers a PATCH route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered PATCH route.
     */
    static patch(router: Router, path: string, middlewares: RequestHandler[]): Router {
        SwaggerConfig.recordApi(path, SwaggerMethod.PATCH, this);
        return router.patch(path, ...middlewares, this.handler());
    }

    /**
     * @method MasterController.socketIO
     * @description Registers a socket event for the controller class.
     * @param {string} event - Event name.
     */
    static socketIO(event: string) {
        this.socketRequests.push({ event, masterController: new this() });
    }
}

export default MasterController;
