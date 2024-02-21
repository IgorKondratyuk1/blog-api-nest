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

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    console.log('\nBadRequestExceptionFilter ' + new Date());
    console.log('status:\n' + status);
    console.log('response:\n' + response);
    console.log('responseBody:\n' + responseBody);

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      message: 'Oops, something went wrong',
    });
  }
}
