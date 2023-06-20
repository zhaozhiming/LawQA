import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { aesDecrypt } from '../utils/crypto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/schemas/user.schema';
import { ApiException } from '../common/exceptions/api.exception';
import { ApiError } from '../common/api-error';

export interface SimpleUser {
  name: string;
  account: string;
  lock?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(account: string, pass: string): Promise<SimpleUser> {
    let user = await this.usersService.findUser(account);
    const maxLockCount = this.configService.get<number>(
      'PASSWORD_MAX_TRY_COUNT'
    );
    // 用户不存在
    if (!user) {
      const error = ApiError.WRONG_USER;
      throw new ApiException(
        ApiError.customInstance(error.getCode(), error.getMessage(), {
          detail: `，还有${maxLockCount - 1}次机会`,
        })
      );
    }

    const { status, lock } = user;
    // 用户已过期
    if (status === UserStatus.EXPIRED) {
      throw new ApiException(ApiError.USER_EXPIRED);
    }

    // 用户被锁定
    if (status === UserStatus.LOCKED) {
      const lockTimeInterval =
        this.configService.get<number>('LOCK_TIME_INTERVAL');
      if (
        lock.time.getTime() + lockTimeInterval * 60 * 1000 >
        new Date().getTime()
      ) {
        throw new ApiException(ApiError.USER_LOCKED);
      } else {
        // 解锁用户
        user = await this.usersService.unlockUser(account);
      }
    }

    const decryptPass = aesDecrypt(
      user.password,
      process.env.SALT || 'salt',
      process.env.IV || 'iv'
    );
    if (decryptPass === pass) {
      // 密码正确则不返回错误次数
      return { name: user.nickname, account: user.account };
    }
    // 密码错误则返回错误次数-1
    const lockCount = await this.usersService.updateUserLock(
      account,
      user.lock
    );
    if (lockCount === 0) {
      throw new ApiException(ApiError.USER_LOCKED);
    }
    return { name: user.nickname, account, lock: lockCount };
  }

  async login(user: SimpleUser) {
    const payload = { username: user.name, sub: user.account };
    await this.usersService.unlockUser(user.account);
    return {
      code: 0,
      data: {
        account: user.account,
        name: user.name,
        access_token: this.jwtService.sign(payload),
      },
    };
  }
}
