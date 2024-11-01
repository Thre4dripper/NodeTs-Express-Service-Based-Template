import { NextFunction, Request, Response, Handler } from 'express';

const asyncHandler = (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
