import { Controller, Post, Body, UseGuards, Request, Get, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response } from 'express'; // Import Response type from express

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registers a new user and sets the JWT in an HTTP-only cookie.
   */
  @Post('signup')
  async register(
    @Body() createUserDto: CreateUserDto, 
    @Res({ passthrough: true }) response: Response // Inject response object
  ) {
    const { user, token } = await this.authService.register(createUserDto);
    
    // Set JWT as an HTTP-only cookie
    response.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
      sameSite: 'none', // to send cookies on different sites
      maxAge: 3600000, // 1 hour expiration in milliseconds
    });

    return { message: 'Registration successful. Token set in HTTP-only cookie.', user: { 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName 
    }};
  }

  /**
   * Logs in a user and sets the JWT in an HTTP-only cookie.
   */
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto, 
    @Res({ passthrough: true }) response: Response // Inject response object
  ) {
    const token = await this.authService.login(loginUserDto);

    // Set JWT as an HTTP-only cookie
    response.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 3600000, // 1 hour expiration in milliseconds
    });

    return { message: 'Login successful. Token set in HTTP-only cookie.' };
  }

  /**
   * Clears the 'jwt' cookie to log the user out.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt', {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { message: 'Successfully logged out.' };
  }

  /**
   * Protected route to retrieve the authenticated user's profile.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}