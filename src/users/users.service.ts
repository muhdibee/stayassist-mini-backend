import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  // Inject the Mongoose Model for the User
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Creates a new user in the database.
   * This method assumes the password has already been hashed by the caller (AuthService).
   * @param createUserDto The user data (email, password, name).
   * @returns The created user document.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);

      return createdUser.save();
    } catch (error) {
      // Handle potential errors like duplicate email
      if (error.code === 11000) {
        throw new InternalServerErrorException('A user with this email already exists.');
      }
      throw error;
    }
  }

  /**
   * Finds a user by their unique email address.
   * Includes the password hash (`select('+password')`) for validation during login.
   * @param email The email address to search for.
   * @returns The user document or null if not found.
   */
  async findOneByEmail(email: string): Promise<UserDocument | null> {
    // `password` must be explicitly selected as it is set to `select: false` in the schema
    return this.userModel.findOne({ email }).select('+password').exec();
  }
  
  /**
   * Finds any single user in the database. Used for seeding logic.
   * @returns Any user document or null.
   */
  async findAnyUser(): Promise<UserDocument | null> {
    return this.userModel.findOne().exec();
  }

  /**
   * Finds a user by their ID.
   * @param id The user's ID.
   * @returns The user document.
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }
}