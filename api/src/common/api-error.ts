export class ApiError {
  // common
  static readonly UNKNOWN_ERROR = new ApiError(10000, '未知错误');

  private constructor(private code: number, private message: string) {}

  static customInstance(
    code: number,
    message: string,
    options: Record<string, any>
  ) {
    return new ApiError(code, `${message}${options.detail}`);
  }

  toString() {
    return `${this.code}: ${this.message}`;
  }

  getCode() {
    return this.code;
  }

  getMessage() {
    return this.message;
  }
}
