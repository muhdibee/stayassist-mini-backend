import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/schemas/user.schema';

/**
 * Passport Local Strategy for validating username (email) and password.
 * This is used during the initial login request.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Configure the strategy to look for 'email' instead of default 'username'
    super({
      usernameField: 'email',
    });
  }

  /**
   * Validates the user's credentials against the database.
   * @param email The user's email.
   * @param password The user's plaintext password.
   * @returns The user object (excluding the password hash) if validation is successful.
   * @throws UnauthorizedException if validation fails.
   */
  async validate(email: string, password: string): Promise<any> {
    const user: User | null = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user.toObject();
    return result;
  }
}