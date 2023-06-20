import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService, SimpleUser } from './auth.service';
import { ApiException } from '../common/exceptions/api.exception';
import { ApiError } from '../common/api-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(account: string, password: string): Promise<SimpleUser> {
    const user = await this.authService.validateUser(account, password);
    if (user.lock > 0) {
      const error = ApiError.WRONG_USER;
      throw new ApiException(
        ApiError.customInstance(error.getCode(), error.getMessage(), {
          detail: `，还有${user.lock}次机会`,
        })
      );
    }
    return user;
  }
}
