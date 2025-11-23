import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
// import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // 3. Configure JWT settings dynamically using ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // Make sure ConfigModule is available
      inject: [ConfigService], // Inject the ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Fetch secret from environment
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME')as any, // Fetch expiry from environment
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  // Exporting AuthService and JwtModule is common if other modules need to use them
  exports: [AuthService, JwtModule],
})
export class AuthModule {}