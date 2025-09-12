import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { LoginApiDocs } from './decorators/login.decorator';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {};

  @Post("login")
  @UseGuards(XDomainGuard, XApiKeyGuard)
  @LoginApiDocs()
  async login(@Body() body: LoginUserDto, @Res({ passthrough: true }) res: Response): Promise<Pick<LoginResponse, 'accessToken' | 'refreshToken'> | { status: false, message: string }> {
    const startTime = Date.now();
    try {
      const result = await this.authService.login(body);
      
      // Проверяем, что это успешный ответ с токенами
      if ('accessToken' in result && 'refreshToken' in result) {
        // Устанавливаем cookies
        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 минут
        });
        
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });
        return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }
      }
      return result;
    } finally {
      const executionTime = Date.now() - startTime;
      console.log(`⏱️  [AuthController.login] Execution time: ${executionTime}ms`);
    }
  };
};
