import { Request, RequestHandler, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

interface CustomRequest extends Request {
    user?: any; // Making user property optional to avoid type errors
}

const authzMiddleware: (requiredRole: string) => RequestHandler<ParamsDictionary, any, any> = (requiredRole: string) => (req: CustomRequest, res: Response<any>, next: NextFunction) => {
    if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
};

export { authzMiddleware };