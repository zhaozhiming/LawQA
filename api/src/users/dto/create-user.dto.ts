import { UserStatus, UserType } from '../schemas/user.schema';

export class CreateUserDto {
  readonly uuid: string;
  readonly account: string;
  readonly password: string;
  readonly nickname: string;
  readonly type: UserType;
  readonly status: UserStatus;
  readonly expiredAt: Date;
}
