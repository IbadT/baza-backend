import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordVerifierService } from './password-verifier.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordVerifierService],
})
export class AuthModule {}
