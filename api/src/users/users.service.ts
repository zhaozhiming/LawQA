import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserLock,
  UserStatus,
} from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async findUser(account: string): Promise<User | undefined> {
    return this.userModel.findOne({ account });
  }

  async updateUserLock(account: string, lock: UserLock): Promise<number> {
    let user: User | null;
    if (lock) {
      // 密码错误次数达到上限
      if (lock.count - 1 === 0) {
        user = await this.lockUser(account);
      } else {
        user = await this.userModel.findOneAndUpdate(
          { account },
          { 'lock.count': lock.count - 1 },
          { returnDocument: 'after' }
        );
      }
    } else {
      // 首次密码错误
      const maxLockCount = this.configService.get<number>(
        'PASSWORD_MAX_TRY_COUNT'
      );
      user = await this.userModel.findOneAndUpdate(
        { account },
        { 'lock.count': maxLockCount - 1 },
        { returnDocument: 'after' }
      );
    }
    return user.lock.count;
  }

  async unlockUser(account: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { account },
      { $unset: { lock: 1 }, status: UserStatus.NORMAL },
      { returnDocument: 'after' }
    );
  }

  async lockUser(account: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { account },
      { status: UserStatus.LOCKED, 'lock.count': 0, 'lock.time': new Date() },
      { returnDocument: 'after' }
    );
  }

  async expireUsers(): Promise<void> {
    const users = await this.userModel.find({ status: UserStatus.NORMAL });
    for (const user of users) {
      try {
        if (!user.expiredAt) continue;

        if (user.expiredAt.getTime() < new Date().getTime()) {
          await this.userModel.updateOne(
            { _id: user._id },
            { status: UserStatus.EXPIRED }
          );
        }
      } catch (e) {
        this.logger.error(`Expire user ${user.account} error: ${e}`);
      }
    }
  }
}
