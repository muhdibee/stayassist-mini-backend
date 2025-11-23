import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

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
  readonly firstName: string; // Required, matches your schema

  @IsOptional()
  @IsString()
  readonly lastName?: string; // Optional, matches your schema
}  