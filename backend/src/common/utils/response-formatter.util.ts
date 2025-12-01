import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;

  constructor(statusCode: HttpStatus, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success', statusCode: HttpStatus = HttpStatus.OK): ApiResponse<T> {
    return new ApiResponse(statusCode, message, data);
  }

  static error(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR): ApiResponse<any> {
    return new ApiResponse(statusCode, message, null);
  }
}