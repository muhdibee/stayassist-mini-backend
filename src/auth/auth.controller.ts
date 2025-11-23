import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint for user login.
   * Uses the 'Local' Guard (LocalStrategy) to validate the user's email and password.
   * If validation succeeds, Passport attaches the validated user object to req.user.
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // The LoginDto validation is implied and handled by NestJS ValidationPipe
  async login(@Request() req: { user: User }) {
    // The user object (without password) is available on req.user thanks to LocalStrategy
    // We pass the user object to AuthService to generate the JWT
    return this.authService.login(req.user);
  }
  
  /**
   * Protected route to fetch the user's profile data.
   * Uses the 'Jwt' Guard (JwtStrategy) which verifies the JWT in the Authorization header.
   * If the JWT is valid, the payload data (userId, email) is attached to req.user.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user contains the decoded JWT payload (userId and email) from JwtStrategy
    return req.user;
  }
}