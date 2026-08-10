import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const message =
      typeof errorResponse === 'object' && errorResponse !== null
        ? (errorResponse as Record<string, unknown>).message || errorResponse
        : errorResponse;

    const logContext = `HTTP ${status} [${request.method}] ${request.url} - ${JSON.stringify(message)}`;

    if (status >= 500) {
      this.logger.error(logContext, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(logContext);
    }

    response.status(status).json({
      statusCode: status,
      error: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
