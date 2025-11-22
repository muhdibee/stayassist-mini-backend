import { IsString, IsEmail, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new User.
 * Ensures that incoming request data adheres to the defined validation rules.
 */
export class CreateUserDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @IsString()
  readonly name: string;
} 