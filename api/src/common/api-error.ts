export class ApiError {
  // common
  static readonly UNKNOWN_ERROR = new ApiError(10000, '未知错误');

  // user
  static readonly WRONG_USER = new ApiError(10001, '用户名或密码错误');
  static readonly USERNAME_EMPTY = new ApiError(10002, '用户名不能为空');
  static readonly PASSWORD_EMPTY = new ApiError(10003, '密码不能为空');
  static readonly USER_LOCKED = new ApiError(10004, '账户已锁定');
  static readonly USER_EXPIRED = new ApiError(10005, '账户已过期');

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
