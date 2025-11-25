import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  // Inject the Mongoose Model for the User
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Creates a new user in the database.
   * Passwords are automatically hashed before saving.
   * @param createUserDto The user data (email, password, name).
   * @returns The created user document.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

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
   * This is critical for the Passport Local Strategy (or similar) used in Auth.
   * @param email The email address to search for.
   * @returns The user document or null if not found.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    // `password` is defined with `select: false` in the schema, so include it explicitly
    // when we need to validate credentials.
    return this.userModel.findOne({ email }).select('+password').exec();
  }
  /**
   * Finds any single user in the database. Used for seeding logic.
   * @returns Any user document or null.
   */
  async findAnyUser(): Promise<UserDocument | null> {
    return this.userModel.findOne().exec();
  }
}
