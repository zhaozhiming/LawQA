import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private usersService: UsersService) {}

  @Cron('0 1 * * * *')
  async handleExpireUsers() {
    this.logger.log(`Expire users start...`);
    await this.usersService.expireUsers();
    this.logger.log(`Expire users end...`);
  }
}
