import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    // Inject the UsersService to interact with user data
    private usersService: UsersService,
    // Inject the JwtService to create tokens
    private jwtService: JwtService,
  ) {}

  /**
   * Step 1: Validates a user's email and password.
   * Used by the LocalStrategy during the login process.
   * @param email The user's email.
   * @param pass The user's plaintext password.
   * @returns The user document if valid, otherwise null.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    // console.log("User found in validateUser:", user);

    if (user && user.password) {
      // Compare the plaintext password with the hashed password in the database
      const isMatch = await bcrypt.compare(pass, user.password);
      // console.log("Password match result:", isMatch);

      if (isMatch) {
        // Return the user without the password hash
        return user;
      }
    }
    return null;
  }

  /**
   * Step 2: Creates an access token for a validated user.
   * @param user The validated user object.
   * @returns An object containing the JWT access token.
   */
  async login(user: User) {
    // Define the data to be stored in the JWT payload
    const payload = { email: user.email, sub: user._id.toString() };
    
    // Sign the payload to create the JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}