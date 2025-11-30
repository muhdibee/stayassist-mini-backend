import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Import Request type from express

/**
 * Custom function to extract JWT from the 'jwt' cookie.
 */
const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt']; // Name of the cookie
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // CRUCIAL CHANGE: Use the custom cookieExtractor
      jwtFromRequest: cookieExtractor, 
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  /**
   * Validate function runs after the token is verified.
   * The payload is the decoded JWT.
   */
  async validate(payload: any) {
    // Returns the decoded user data, which is attached to req.user
    return { userId: payload.sub, email: payload.email };
  }
}