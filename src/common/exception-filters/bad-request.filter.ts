import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'class-validator';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    if (typeof responseBody === 'object') {
      const errorResponse = [];

      if (isArray(responseBody.message)) {
        responseBody.message.forEach((m) => errorResponse.push({ field: m.field, message: m.message }));
      } else {
        errorResponse.push({ message: responseBody.message });
      }

      response.status(status).json({
        errorsMessages: errorResponse,
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
