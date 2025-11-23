import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint to register a new user.
   * This would typically be part of the AuthModule, but is included here for demonstration.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // A hypothetical endpoint to get all users (for administrative/testing purposes)
  // Note: In a real app, this would be guarded by authentication and roles.
  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }
}