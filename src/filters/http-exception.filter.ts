import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;

      // Handle ValidationPipe errors
      const responseBody = exception.getResponse();
      if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        const errorResponse = responseBody as { message: unknown };
        if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message.join(', ');
        } else if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Map common error names to HTTP status codes
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
      } else if (exception.name === 'UnauthorizedError') {
        status = HttpStatus.UNAUTHORIZED;
      } else if (exception.name === 'ForbiddenError') {
        status = HttpStatus.FORBIDDEN;
      } else if (exception.name === 'NotFoundError') {
        status = HttpStatus.NOT_FOUND;
      }
    } else if (typeof exception === 'string') {
      message = exception;
    }

    // Log the error for debugging
    console.error(`[${new Date().toISOString()}] Error:`, {
      status,
      message,
      path: request.path,
      method: request.method,
      exception: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json({
      success: false,
      method: request.method,
      path: request.path,
      message: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
