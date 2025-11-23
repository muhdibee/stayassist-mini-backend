import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';

@Module({
  imports: [
    // 1. Import the UsersModule to use the UsersService (which validates credentials)
    UsersModule,
    // 2. Configure Passport to use the default 'jwt' strategy
    PassportModule,
    // 3. Configure JWT settings (secret key and expiration)
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "600h" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  // Exporting AuthService and JwtModule is common if other modules need to use them
  exports: [AuthService, JwtModule],
})
export class AuthModule {}