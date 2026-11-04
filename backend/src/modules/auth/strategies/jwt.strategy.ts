import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.auth_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Re-check the user on every request: a deleted or deactivated account
  // must lose access immediately, not when its 60-minute token expires.
  async validate(payload: any) {
    const user = await this.userModel
      .findById(payload.sub)
      .select('email role isActive')
      .lean()
      .exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account no longer exists or has been deactivated',
      );
    }
    return { userId: String(user._id), email: user.email, role: user.role };
  }
}
