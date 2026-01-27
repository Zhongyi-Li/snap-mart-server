import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

export interface ApiErrorResponse {
  code: number;
  message: string;
  success: boolean;
  data: null;
}

type ExceptionResponseBody = {
  message?: string | string[];
};

function isExceptionResponseBody(
  value: unknown,
): value is ExceptionResponseBody {
  return typeof value === 'object' && value !== null && 'message' in value;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: unknown = exception.getResponse();

    let message = exception.message;
    if (
      isExceptionResponseBody(exceptionResponse) &&
      exceptionResponse.message
    ) {
      message =
        typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : exceptionResponse.message[0];
    }

    const apiResponse: ApiErrorResponse = {
      code: status,
      message,
      success: false,
      data: null,
    };

    response.status(status).json(apiResponse);
  }
}
