import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiError } from '../api-error';

export class ApiException extends HttpException {
  private error: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.getMessage(), HttpStatus.OK);
    this.error = apiError;
  }

  getErrorCode(): number {
    return this.error.getCode();
  }

  getErrorMessage(): string {
    return this.error.getMessage();
  }
}
