const { default: RequestBuilder, PayloadType } = require('./RequestBuilder');
const asyncHandler = require('./AsyncHandler');
const { default: SwaggerConfig, SwaggerMethod } = require('../../config/swaggerConfig');
const ResponseBuilder = require('./ResponseBuilder');
const { executeGrpcMiddlewares } = require('./GrpcMiddleware');
const { ValidationError, grpcCustomErrorHandler } = require('../handlers/CustomErrorHandler');
const { createLogger } = require('./Logger');

const grpcLog = createLogger('grpc');

/**
 * @class MasterController
 * @description This class is used to create a controller class
 * @summary extends this class to create a controller class for a route or socket event
 * and override the restController or socketController method
 * to write the controller logic for the route or socket event respectively
 */
class MasterController {
    // start socket requests snippet
    static socketRequests = [];

    /**
     * @method MasterController.getSocketRequests
     * @description This static method is used to retrieve all the socket requests instances for a controller class.
     *
     * @returns {ISocketClient[]} - Returns an array of ISocketClient objects, each representing a socket request instance
     */
    static getSocketRequests() {
        return this.socketRequests;
    }

    // end socket requests snippet

    // start cron jobs snippet
    static cronRequests = [];

    /**
     * @method MasterController.getCronRequests
     * @description This static method is used to retrieve all the cron job instances for a controller class.
     *
     * @returns {ICronJob[]} - Returns an array of ICronJob objects, each representing a cron job instance
     */
    static getCronRequests() {
        return this.cronRequests;
    }

    // end cron jobs snippet

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
    static doc() {
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
     * payloadValidator.addToPath(
     *    Joi.object().keys({
     *        id: Joi.number().required(),
     *    })
     * );
     * // Return the configured payload validator for further usage
     * return payloadValidator;
     */
    static validate() {
        return new RequestBuilder();
    }

    /**
     * @method MasterController.restController
     * @description Handles the controller logic after validating the request payload.
     * @param {Object} params - Parameters from the request URL.
     * @param {Object} query - Query parameters from the request URL.
     * @param {Object} body - Body content from the request.
     * @param {Object} headers - Headers from the request.
     * @param {Object} allData - Contains all data including params, query, body, headers, and custom data from middlewares.
     * @protected This method is protected and can only be accessed by the child class.
     * @returns {Promise<any>} Promise resolving to any value representing the response.
     */
    async restController(params, query, body, headers, allData) {
        // Controller logic goes here
        grpcLog.debug({ params, query, body, headers, allData }, 'restController');
        // Return a ResponseBuilder instance
        return new ResponseBuilder(200, null, 'Success');
    }

    /**
     * @method MasterController.socketController
     * @description Handles the logic for socket events.
     * @param {Server} io - Instance of the Socket.IO server.
     * @param {Socket} socket - Socket instance representing the client connection.
     * @param {any} payload - Payload data received from the client.
     * @protected This method is protected and can only be accessed by the child class.
     * @returns {any} Returns any value, usually the response or processing result.
     */
    socketController(io, socket, payload) {
        // Logic for handling socket events goes here
        grpcLog.debug({ payload, socketId: socket.id }, 'socketController');
    }

    /**
     * @method MasterController.cronController
     * @description Handles the logic for cron jobs.
     */
    cronController() {
        // Implement cron job logic here
        grpcLog.info('Cron job executed');
    }

    // ─────────────────────────── gRPC controllers ───────────────────────────
    // Override the one(s) you need. The single static rpc() facade dispatches to
    // the matching one based on the proto method's streaming kind.

    /** gRPC unary handler (single request → single response). */
    async grpcController(request, metadata, call) {
        grpcLog.debug({ request }, 'grpcController (unary)');
        return new ResponseBuilder(200, null, 'Success');
    }

    /** gRPC server-streaming handler (single request → stream of responses). */
    async grpcServerStreamController(request, metadata, call) {
        grpcLog.debug({ request }, 'grpcServerStreamController');
    }

    /** gRPC client-streaming handler (stream of requests → single response). */
    async grpcClientStreamController(chunks, metadata, call) {
        grpcLog.debug({ count: chunks.length }, 'grpcClientStreamController');
        return new ResponseBuilder(200, null, 'Success');
    }

    /** gRPC bidirectional-streaming handler — called once per incoming chunk. */
    async grpcBidiStreamController(chunk, metadata, call) {
        grpcLog.debug({ chunk }, 'grpcBidiStreamController');
        return undefined;
    }

    /**
     * Validate a gRPC request message against the schema registered via
     * RequestBuilder.addToGrpcPayload(). Throws ValidationError on failure.
     */
    static grpcValidate(schema, request) {
        const { error, value } = schema.validate(request, {
            abortEarly: false,
            allowUnknown: true,
        });
        if (error) {
            throw new ValidationError(error.details.map((d) => d.message).join(', '), 400);
        }
        return value;
    }

    /**
     * @method MasterController.rpc
     * @description THE single gRPC entry point for controllers. Returns a handler
     * usable directly in server.addService(). Auto-detects the streaming kind
     * (unary / server / client / bidi) and dispatches to the matching strategy.
     */
    static rpc(middlewares = []) {
        const self = this;
        return (call, callback) => {
            const hasRequest = call && typeof call === 'object' && 'request' in call;
            const hasCallback = typeof callback === 'function';

            if (hasCallback && hasRequest) {
                return self.unaryStrategy(middlewares, call, callback);
            }
            if (hasCallback && !hasRequest) {
                return self.clientStreamStrategy(middlewares, call, callback);
            }
            if (!hasCallback && hasRequest) {
                return self.serverStreamStrategy(middlewares, call);
            }
            return self.bidiStreamStrategy(middlewares, call);
        };
    }

    static async unaryStrategy(middlewares, call, callback) {
        const self = this;
        try {
            let request = call.request;
            grpcLog.info({ method: call.getPath ? call.getPath() : 'unary' }, 'gRPC request');
            const ctx = { request, metadata: call.metadata, call };
            await executeGrpcMiddlewares(middlewares, ctx);

            const schema = self.validate().getGrpcSchema();
            if (schema) {
                request = self.grpcValidate(schema, request);
                ctx.request = request;
            }

            const controller = new self();
            const result = await controller.grpcController(ctx.request, ctx.metadata, call);
            if (result.response.status >= 200 && result.response.status < 300) {
                callback(null, result.response.data);
            } else {
                callback(grpcCustomErrorHandler(result));
            }
        } catch (error) {
            callback(grpcCustomErrorHandler(error));
        }
    }

    static async serverStreamStrategy(middlewares, call) {
        const self = this;
        try {
            let request = call.request;
            const ctx = { request, metadata: call.metadata, call };
            await executeGrpcMiddlewares(middlewares, ctx);

            const schema = self.validate().getGrpcSchema();
            if (schema) {
                request = self.grpcValidate(schema, request);
                ctx.request = request;
            }

            const controller = new self();
            await controller.grpcServerStreamController(ctx.request, ctx.metadata, call);
            call.end();
        } catch (error) {
            call.emit('error', grpcCustomErrorHandler(error));
        }
    }

    static async clientStreamStrategy(middlewares, call, callback) {
        const self = this;
        try {
            const chunks = [];
            await new Promise((resolve, reject) => {
                call.on('data', (chunk) => chunks.push(chunk));
                call.on('end', () => resolve());
                call.on('error', reject);
            });

            const ctx = { request: chunks, metadata: call.metadata, call };
            await executeGrpcMiddlewares(middlewares, ctx);

            const schema = self.validate().getGrpcSchema();
            const finalChunks = schema ? chunks.map((c) => self.grpcValidate(schema, c)) : chunks;

            const controller = new self();
            const result = await controller.grpcClientStreamController(
                finalChunks,
                ctx.metadata,
                call
            );
            if (result.response.status >= 200 && result.response.status < 300) {
                callback(null, result.response.data);
            } else {
                callback(grpcCustomErrorHandler(result));
            }
        } catch (error) {
            callback(grpcCustomErrorHandler(error));
        }
    }

    static bidiStreamStrategy(middlewares, call) {
        const self = this;
        const ctx = { request: null, metadata: call.metadata, call };
        executeGrpcMiddlewares(middlewares, ctx)
            .then(() => {
                const schema = self.validate().getGrpcSchema();
                call.on('data', async (chunk) => {
                    try {
                        const validated = schema ? self.grpcValidate(schema, chunk) : chunk;
                        const controller = new self();
                        const result = await controller.grpcBidiStreamController(
                            validated,
                            ctx.metadata,
                            call
                        );
                        if (result !== undefined && result !== null) {
                            if (Array.isArray(result)) {
                                result.forEach((item) => call.write(item));
                            } else {
                                call.write(result);
                            }
                        }
                    } catch (error) {
                        call.emit('error', grpcCustomErrorHandler(error));
                    }
                });
                call.on('end', () => call.end());
            })
            .catch((error) => call.emit('error', grpcCustomErrorHandler(error)));
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
    static joiValidator(params, query, body, validationRules) {
        // Check if there are no validation rules, return null (no validation needed)
        if (validationRules.get.length === 0) {
            return null;
        }
        // Object to store validation errors
        const joiErrors = {
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
    static handler() {
        // Using 'self' to access the class within the async function scope
        const self = this;
        // Returns an async function serving as a RequestHandler for Express
        return asyncHandler(async (req, res) => {
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
    static get(router, path, middlewares) {
        SwaggerConfig.recordApi(path, SwaggerMethod.GET, this);
        return router.get(path, middlewares, this.handler());
    }

    /**
     * @method MasterController.post
     * @description Registers a POST route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered POST route.
     */
    static post(router, path, middlewares) {
        SwaggerConfig.recordApi(path, SwaggerMethod.POST, this);
        return router.post(path, middlewares, this.handler());
    }

    /**
     * @method MasterController.put
     * @description Registers a PUT route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered PUT route.
     */
    static put(router, path, middlewares) {
        SwaggerConfig.recordApi(path, SwaggerMethod.PUT, this);
        return router.put(path, middlewares, this.handler());
    }

    /**
     * @method MasterController.delete
     * @description Registers a DELETE route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered DELETE route.
     */
    static delete(router, path, middlewares) {
        SwaggerConfig.recordApi(path, SwaggerMethod.DELETE, this);
        return router.delete(path, middlewares, this.handler());
    }

    /**
     * @method MasterController.patch
     * @description Registers a PATCH route for the controller class.
     * @param {Router} router - Router object.
     * @param {string} path - Path for the route.
     * @param {RequestHandler[]} middlewares - Middlewares for the route.
     * @returns {Router} Router object with the registered PATCH route.
     */
    static patch(router, path, middlewares) {
        SwaggerConfig.recordApi(path, SwaggerMethod.PATCH, this);
        return router.patch(path, middlewares, this.handler());
    }

    /**
     * @method MasterController.socketIO
     * @description Registers a socket event for the controller class.
     * @param {string} event - Event name.
     */
    static socketIO(event) {
        this.socketRequests.push({ event, masterController: new this() });
    }

    /**
     * @method MasterController.cronJob
     * @description Registers a cron job for the controller class.
     * @param {string} cronPattern - Cron pattern for the job.
     */
    static cronJob(cronPattern) {
        this.cronRequests.push({ cronPattern, masterController: new this() });
    }
}

module.exports = MasterController;
