import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';



// Import feature modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    // 1. Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 2. Connect to MongoDB Atlas
    // Using forRootAsync allows injecting ConfigService to read the URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // Read URI from .env
      }),
      inject: [ConfigService],
    }),
    
    // 3. Feature Modules
    UsersModule,
    AuthModule,
    ListingsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}