import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = req.get('Authorization').replace('Bearer', '').trim();
    const cacheToken = await this.cacheService.get(payload.sub);
    if (cacheToken && cacheToken !== token) {
      await this.cacheService.del(payload.sub);
      throw new UnauthorizedException();
    }
    if (!cacheToken) {
      await this.cacheService.set(payload.sub, token, { ttl: 60 * 60 * 2 });
      return { account: payload.sub, username: payload.username };
    }

    return { account: payload.sub, username: payload.username };
  }
}
