import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;
    const message = exceptionResponse.message || exception.message;

    // Log errors for debugging
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.path} - Status: ${status} - Message: ${JSON.stringify(message)}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.path} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      message: message,
      ...(status >= 500 && { error: 'Internal Server Error' }),
    };

    // Don't expose internal error details to client for 500+ errors
    if (status >= 500) {
      errorResponse.message = 'An error occurred while processing your request';
      delete errorResponse.error;
    }

    response.status(status).json(errorResponse);
  }
}
