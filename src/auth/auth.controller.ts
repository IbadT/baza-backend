import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { LoginApiDocs } from './decorators/login.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {};

  @Post("login")
  @UseGuards(XDomainGuard, XApiKeyGuard)
  @LoginApiDocs()
  async login(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  };
};
