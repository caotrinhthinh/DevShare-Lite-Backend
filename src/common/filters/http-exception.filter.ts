import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const stauts =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const resMessage = (() => {
      if (typeof message === 'string') return message;
      if (typeof message === 'object' && message && 'message' in message) {
        return (message as { message: string }).message;
      }
      return 'Unexpected error';
    })();

    const errorResponse = {
      stautsCode: stauts,
      timeStamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: resMessage,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
    );

    response.status(stauts).json(errorResponse);
  }
}
