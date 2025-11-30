import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Generates a JWT token for a given user.
   */
  private async generateToken(user: any): Promise<{ access_token: string }> {
    const payload = { 
      email: user.email, 
      sub: user._id.toString() // Mongoose ID
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Handles user registration: creates user, hashes password, and returns JWT.
   */
  async register(createUserDto: CreateUserDto) {
    // 1. Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    // 2. Hash password (assuming the user service handles hashing if not done here)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    // 3. Create user
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 4. Generate token and return
    const token = await this.generateToken(newUser);
    return { user: newUser, token };
  }

  /**
   * Handles user login: validates credentials and returns JWT.
   */
  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.generateToken(user);
  }

  /**
   * Validates user credentials (used by the Local Strategy or internal logic).
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      // 1. Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(pass, user.password);

      if (isMatch) {
        // Return user object without the password field for security
        // The return structure must match what `validate` in the JwtStrategy expects
        const { password, ...result } = user.toObject();
        return result; 
      }
    }
    return null;
  }
}