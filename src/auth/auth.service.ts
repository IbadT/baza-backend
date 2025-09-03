import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import * as sql from 'mssql';
import { PasswordVerifierService } from './password-verifier.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private passwordVerifier: PasswordVerifierService
  ) {}

  async login(body: LoginUserDto) {
    const { email, password } = body;

    // Конфигурация подключения к MSSQL
    const config: sql.config = {
      user: this.configService.get<string>('DB_USERNAME') || '',
      password: this.configService.get<string>('DB_PASSWORD') || '',
      server: this.configService.get<string>('DB_HOST') || '',
      database: this.configService.get<string>('DB_DATABASE') || '',
      port: parseInt(this.configService.get<string>('DB_PORT') || '1433'),
      options: {
        encrypt: false, // Для локальных подключений
        trustServerCertificate: true,
      },
    };

    try {
      // Подключение к базе данных
      const pool = await sql.connect(config);
      console.log('✅ Подключение к MSSQL успешно установлено');

      // Прямой SQL запрос для получения пользователя из AspNetUsers
      let query = `
        SELECT 
          u.Id,
          u.Email,
          u.UserName,
          u.EmailConfirmed,
          u.NormalizedEmail,
          u.NormalizedUserName,
          u.PasswordHash
        FROM AspNetUsers u 
        WHERE u.Email = @email
      `;
      
      let result = await pool.request().input('email', sql.VarChar, email).query(query);
      
      // Если пользователь не найден в AspNetUsers, пробуем в auth_user (Django)
      if (result.recordset.length === 0) {
        console.log('🔍 Пользователь не найден в AspNetUsers, проверяю auth_user...');
        
        query = `
          SELECT 
            u.id,
            u.email,
            u.username,
            u.first_name,
            u.last_name,
            u.is_superuser,
            u.last_login
          FROM auth_user u 
          WHERE u.email = @email
        `;
        
        result = await pool.request().input('email', sql.VarChar, email).query(query);
      }
      
      console.log('🔍 Результат запроса пользователя:');
      console.log('📧 Email:', email);
      console.log('📊 Найдено записей:', result.recordset.length);
      
      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        console.log('👤 Данные пользователя:', JSON.stringify(user, null, 2));
        
        // Проверяем пароль используя универсальный сервис
        if (user.PasswordHash) {
          console.log('🔍 Проверяю пароль...');
          const isPasswordValid = this.passwordVerifier.verifyPassword(password, user.PasswordHash);
          
          if (!isPasswordValid) {
            console.log('❌ Неверный пароль');
            return { success: false, message: 'Неверный email или пароль' };
          }
          
          console.log('✅ Пароль верный');
        } else {
          console.log('⚠️  PasswordHash не найден в данных пользователя');
        }
        
        return { success: true, user };
      } else {
        console.log('❌ Пользователь не найден');
        return { success: false, message: 'Пользователь не найден' };
      }

    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      throw new Error(`Ошибка аутентификации: ${error.message}`);
    }
  }
}
