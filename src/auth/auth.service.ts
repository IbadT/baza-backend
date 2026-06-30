import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordVerifierService } from './password-verifier.service';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/logger/logger.service';
import { AuthRepository } from 'src/database/repositories/auth.repository';

export interface LoginResponse {
  status: boolean;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private passwordVerifier: PasswordVerifierService,
    private jwtService: JwtService,
    private readonly authRepo: AuthRepository,
    private readonly logger: AppLogger,
  ) {}

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<LoginResponse | { status: false; message: string }> {
    const { email, password } = loginUserDto;

    try {
      this.logger.log('Подключение к MSSQL установлено', 'AuthService');

      const user = await this.authRepo.findUserByEmail(email);

      this.logger.log(`Получено ${user ? 1 : 0} записей из БД`, 'AuthService');

      if (user) {
        this.logger.log(
          'Пользователь найден, проверка пароля...',
          'AuthService',
        );

        if (user.PasswordHash) {
          const isPasswordValid = this.passwordVerifier.verifyPassword(
            password,
            user.PasswordHash,
          );

          if (!isPasswordValid) {
            this.logger.warn('Неверный пароль', 'AuthService');
            return { status: false, message: 'Неверный email или пароль' };
          }

          this.logger.log('Пароль верный, генерация токенов...', 'AuthService');

          const tokens = await this.generateUserToken(
            user.Id,
            user.Email,
            user.Roles
              ? user.Roles.split(',').map((r: string) => r.trim())
              : [],
          );
          return { status: true, ...tokens };
        } else {
          this.logger.warn(
            'PasswordHash не найден в данных пользователя',
            'AuthService',
          );
          return { status: false, message: 'Неверный email или пароль' };
        }
      } else {
        this.logger.warn('Пользователь не найден', 'AuthService');
        return { status: false, message: 'Неверный email или пароль' };
      }
    } catch (error) {
      this.logger.error(
        'Ошибка аутентификации',
        error instanceof Error ? error.stack : String(error),
        'AuthService',
      );
      throw new InternalServerErrorException(
        `Ошибка аутентификации: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async generateUserToken(
    id: string,
    email: string,
    roles: string[],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { id, email, roles };
    this.logger.log('Генерация JWT токенов', 'AuthService');

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshIn = this.configService.get<string>('JWT_REFRESH_IN') || '7d';
    const accessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshIn,
    });

    this.logger.log('Токены сгенерированы', 'AuthService');

    return {
      accessToken,
      refreshToken,
    };
  }
}
