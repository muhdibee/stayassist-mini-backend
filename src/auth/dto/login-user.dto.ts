import { IsString, IsEmail, MinLength } from 'class-validator';

/**
 * Data Transfer Object for handling user login requests.
 */
export class LoginUserDto {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;
}