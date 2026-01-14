import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);

    if (res.headersSent) {
        return next(err);
    }

    // Proper error response format
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: 'INTERNAL_ERROR'
    });
};
