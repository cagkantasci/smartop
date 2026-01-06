import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  method: string;
}

// Type guard for Prisma errors
function isPrismaError(exception: unknown): exception is { code: string; meta?: any } {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'code' in exception &&
    typeof (exception as any).code === 'string' &&
    (exception as any).code.startsWith('P')
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HttpException (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string | string[]) || exception.message;
        error = (resp.error as string) || exception.name;
      }
    }
    // Handle Prisma errors
    else if (isPrismaError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002':
          message = 'Bu kayıt zaten mevcut (benzersizlik ihlali)';
          status = HttpStatus.CONFLICT;
          break;
        case 'P2025':
          message = 'Kayıt bulunamadı';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'İlişkili kayıt bulunamadı (yabancı anahtar hatası)';
          break;
        case 'P2014':
          message = 'İlişki kısıtlaması ihlali';
          break;
        default:
          message = 'Veritabanı işlemi başarısız';
      }
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    const errorLog = {
      statusCode: status,
      message,
      error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error('Server Error', errorLog);
    } else if (status >= 400) {
      this.logger.warn('Client Error', errorLog);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }
}
