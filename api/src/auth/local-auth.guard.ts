import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiError } from 'src/common/api-error';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const { username, password } = request.body;
    if (err || !user) {
      if (!username) {
        throw new ApiException(ApiError.USERNAME_EMPTY);
      } else if (!password) {
        throw new ApiException(ApiError.PASSWORD_EMPTY);
      } else {
        throw err || new ApiException(ApiError.UNKNOWN_ERROR);
      }
    }
    return user;
  }
}
