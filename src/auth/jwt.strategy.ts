import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
// import { jwtConstants } from './constants'; // <-- No longer needed

/**
 * Passport JWT Strategy for validating the token provided in the request headers.
 * This is used to protect routes after the user has logged in.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // Inject ConfigService to access environment variables
    private configService: ConfigService, 
  ) {
    // Read secret from environment and fail early if missing to satisfy required typing
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      // Extract the JWT from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ensure the token has not expired
      ignoreExpiration: false,
      // Use the secret key fetched from the environment variables
      secretOrKey: secret,
    });
  }

  /**
   * The validate method is called after the token is successfully verified.
   * It returns the payload data, which is then attached to the request object (req.user).
   * @param payload The decoded JWT payload.
   * @returns An object containing the user's ID and email.
   */
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}