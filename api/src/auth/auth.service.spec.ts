import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiException } from '../common/exceptions/api.exception';
import { ApiError } from '../common/api-error';
import { User, UserStatus } from '../users/schemas/user.schema';
import * as crypto from '../utils/crypto';

describe('AuthService', () => {
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUser: jest.fn(() => null),
            unlockUser: jest.fn(() => null),
            updateUserLock: jest.fn(() => null),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PASSWORD_MAX_TRY_COUNT') return 5;
              if (key === 'LOCK_TIME_INTERVAL') return 60;
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should throw error when user no exist', async () => {
      jest.spyOn(usersService, 'findUser').mockResolvedValue(null);

      await expect(authService.validateUser('foo', '123')).rejects.toEqual(
        new ApiException(
          ApiError.customInstance(
            ApiError.WRONG_USER.getCode(),
            ApiError.WRONG_USER.getMessage(),
            {
              detail: `，还有4次机会`,
            }
          )
        )
      );
    });

    it('should throw error when user locked', async () => {
      const user = new User();
      user.status = UserStatus.LOCKED;
      user.lock = {
        count: 0,
        time: new Date(2023, 1, 1, 10, 0, 0),
      };
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 1, 8, 0, 0));
      jest.spyOn(usersService, 'findUser').mockResolvedValue(user);

      await expect(authService.validateUser('foo', '123')).rejects.toEqual(
        new ApiException(ApiError.USER_LOCKED)
      );
    });

    it('should return user when user lock time failure and password right', async () => {
      const user = new User();
      user.status = UserStatus.LOCKED;
      user.lock = {
        count: 0,
        time: new Date(2023, 1, 1, 10, 0, 0),
      };
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 1, 12, 0, 0));
      jest.spyOn(usersService, 'findUser').mockResolvedValue(user);
      const unlockUser = new User();
      unlockUser.account = 'foo';
      unlockUser.nickname = 'bar';
      jest.spyOn(usersService, 'unlockUser').mockResolvedValue(unlockUser);
      jest.spyOn(crypto, 'aesDecrypt').mockReturnValue('123');

      expect(await authService.validateUser('foo', '123')).toEqual({
        account: 'foo',
        name: 'bar',
      });
    });

    it('should throw error when user lock count is 0', async () => {
      const user = new User();
      user.status = UserStatus.LOCKED;
      user.lock = {
        count: 0,
        time: new Date(2023, 1, 1, 10, 0, 0),
      };
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 1, 12, 0, 0));
      jest.spyOn(usersService, 'findUser').mockResolvedValue(user);
      const unlockUser = new User();
      jest.spyOn(usersService, 'unlockUser').mockResolvedValue(unlockUser);
      jest.spyOn(crypto, 'aesDecrypt').mockReturnValue('245');
      jest.spyOn(usersService, 'updateUserLock').mockResolvedValue(0);

      await expect(authService.validateUser('foo', '123')).rejects.toEqual(
        new ApiException(ApiError.USER_LOCKED)
      );
    });

    it('should throw error when user lock count is 0', async () => {
      const user = new User();
      user.status = UserStatus.LOCKED;
      user.lock = {
        count: 0,
        time: new Date(2023, 1, 1, 10, 0, 0),
      };
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 1, 12, 0, 0));
      jest.spyOn(usersService, 'findUser').mockResolvedValue(user);
      const unlockUser = new User();
      unlockUser.nickname = 'bar';
      jest.spyOn(usersService, 'unlockUser').mockResolvedValue(unlockUser);
      jest.spyOn(crypto, 'aesDecrypt').mockReturnValue('245');
      jest.spyOn(usersService, 'updateUserLock').mockResolvedValue(4);

      expect(await authService.validateUser('foo', '123')).toEqual({
        account: 'foo',
        name: 'bar',
        lock: 4,
      });
    });
  });
});
