import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import * as sql from 'mssql';
import { PasswordVerifierService } from './password-verifier.service';
import { JwtService } from '@nestjs/jwt';

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
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse | { status: false, message: string }> {
    const { email, password } = loginUserDto;
    
    const config = {
      user: this.configService.get<string>('DB_USERNAME') || '',
      password: this.configService.get<string>('DB_PASSWORD') || '',
      server: this.configService.get<string>('DB_HOST') || '',
      database: this.configService.get<string>('DB_DATABASE') || '',
      port: parseInt(this.configService.get<string>('DB_PORT') || '1433'),
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    try {
      const pool = await sql.connect(config);
      console.log('✅ Подключение к MSSQL успешно установлено');

      // Исправленный SQL запрос для получения пользователя с ролями
      let query = `
        SELECT 
          u.Id,
          u.Email,
          u.UserName,
          u.EmailConfirmed,
          u.NormalizedEmail,
          u.NormalizedUserName,
          u.PasswordHash,
          STRING_AGG(r.Name, ',') as Roles
        FROM AspNetUsers u 
        LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
        LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
        WHERE u.Email = @email
        GROUP BY u.Id, u.Email, u.UserName, u.EmailConfirmed, u.NormalizedEmail, u.NormalizedUserName, u.PasswordHash
      `;
      
      let result = await pool.request().input('email', sql.VarChar, email).query(query);
      
      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        console.log('👤 Данные пользователя:', JSON.stringify(user, null, 2));
        
        if (user.PasswordHash) {
          console.log('🔍 Проверяю пароль...');
          const isPasswordValid = this.passwordVerifier.verifyPassword(password, user.PasswordHash);
          
          if (!isPasswordValid) {
            console.log('❌ Неверный пароль');
            return { status: false, message: 'Неверный email или пароль' };
          }
          
          console.log('✅ Пароль верный');
          
          const tokens = await this.generateUserToken(user.Id, user.Email, user.Roles);
          return { status: true, ...tokens };
        } else {
          console.log('⚠️  PasswordHash не найден в данных пользователя');
          return { status: false, message: 'Неверный email или пароль' };
        }
      } else {
        console.log('❌ Пользователь не найден');
        return { status: false, message: 'Неверный email или пароль' };
      }

    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      throw new Error(`Ошибка аутентификации: ${error.message}`);
    }
  }

  async generateUserToken(id: string, email: string, roles: string[]): Promise<{ accessToken: string, refreshToken: string }> {
    const payload = {
      id,
      email,
      roles,
    };
    console.log('payload', payload);

    // Получаем JWT конфигурацию с fallback значениями
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshIn = this.configService.get<string>('JWT_REFRESH_IN') || '7d';
    
    const secret = this.configService.getOrThrow<string>('SECRET_TOKEN');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: expiresIn
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: refreshIn
    });

    return {
      accessToken,
      refreshToken,
    };
  };
};
