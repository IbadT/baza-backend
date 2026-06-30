import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { Throttle } from '@nestjs/throttler';
import { AuthService, LoginResponse } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
// import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
// import { XDomainGuard } from 'src/guards/x-domain.guard';
import { LoginApiDocs } from './decorators/login.decorator';
import { Response } from 'express';
import { AppLogger } from 'src/logger/logger.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Post('login')
  // @Throttle({ login: { limit: 5, ttl: 900000 } })
  // @UseGuards(XDomainGuard, XApiKeyGuard)
  @LoginApiDocs()
  async login(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | Pick<LoginResponse, 'accessToken' | 'refreshToken'>
    | { status: false; message: string }
  > {
    const startTime = Date.now();
    try {
      const result = await this.authService.login(body);

      if ('accessToken' in result && 'refreshToken' in result) {
        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        };
      }
      return result;
    } finally {
      const executionTime = Date.now() - startTime;
      this.logger.log(
        `[AuthController.login] Execution time: ${executionTime}ms`,
        'AuthController',
      );
    }
  }
}
