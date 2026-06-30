import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordVerifierService } from './password-verifier.service';
import { JwtAuthModule } from 'src/jwt/jwt.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule, JwtAuthModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordVerifierService],
})
export class AuthModule {}
