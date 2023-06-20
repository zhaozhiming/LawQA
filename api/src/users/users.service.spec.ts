import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('Userservice', () => {
  let configService: ConfigService;
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PASSWORD_MAX_TRY_COUNT') return 5;
              return null;
            }),
          },
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    configService = module.get<ConfigService>(ConfigService);
    usersService = new UsersService(configService, userModel);
  });

  describe('updateUserLock', () => {
    it('should return user lock count when first time wrong password', async () => {
      const user = new User();
      user.lock = {
        count: 4,
      };
      jest.spyOn(userModel, 'findOneAndUpdate').mockResolvedValue(user);

      expect(await usersService.updateUserLock('foo', undefined)).toBe(4);
    });

    it('should return user lock count when second time wrong password', async () => {
      const user = new User();
      user.lock = {
        count: 3,
      };
      jest.spyOn(userModel, 'findOneAndUpdate').mockResolvedValue(user);

      expect(await usersService.updateUserLock('foo', { count: 4 })).toBe(3);
    });

    it('should return user lock count when last time wrong password', async () => {
      const user = new User();
      user.lock = {
        count: 0,
      };
      jest.spyOn(userModel, 'findOneAndUpdate').mockResolvedValue(user);

      expect(await usersService.updateUserLock('foo', { count: 1 })).toBe(0);
    });
  });
});
