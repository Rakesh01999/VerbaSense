import { ErrorRequestHandler } from 'express';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources: [
            {
                path: '',
                message: err.message,
            },
        ],
        stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
    });
};

export default globalErrorHandler;
