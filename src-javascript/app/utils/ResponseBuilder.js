module.exports = class ResponseBuilder {
    response;

    constructor(status, data, message) {
        this.response = {
            status,
            data,
            message,
        };
    }
};
