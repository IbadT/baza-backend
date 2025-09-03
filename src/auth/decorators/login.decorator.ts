import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';

export const LoginApiDocs = () => {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Вход в систему',
      description: `
Аутентификация пользователя по email и паролю.

**Система проверяет пользователя в двух таблицах:**
1. **AspNetUsers** - основная система аутентификации
2. **auth_user** - резервная система (Django)

**Требования:**
- Обязательные заголовки домена и API ключа
- Валидация email и пароля
- Автоматическое определение системы аутентификации

**Примечание:** Пароли в обеих системах хешированы, требуется дополнительная логика проверки.
      `,
    }),
    ApiHeader({
      name: 'X-Domain',
      description: 'Домен для фильтрации данных (например: domain.ru, domain.by)',
      required: true,
      example: 'domain.ru',
    }),
    ApiHeader({
      name: 'X-API-Key',
      description: 'Секретный ключ домена для авторизации',
      required: true,
      example: 'test-api-key-123',
    }),
    ApiBody({ type: LoginUserDto }),
    // Успешный ответ
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Успешная аутентификация',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          user: {
            type: 'object',
            properties: {
              // AspNetUsers поля
              Id: {
                type: 'string',
                example: 'user-uuid-123',
                nullable: true,
              },
              Email: {
                type: 'string',
                example: 'user@example.com',
                nullable: true,
              },
              UserName: {
                type: 'string',
                example: 'username',
                nullable: true,
              },
              EmailConfirmed: {
                type: 'boolean',
                example: true,
                nullable: true,
              },
              // auth_user поля (Django)
              id: {
                type: 'number',
                example: 1,
                nullable: true,
              },
              email: {
                type: 'string',
                example: 'user@example.com',
                nullable: true,
              },
              username: {
                type: 'string',
                example: 'username',
                nullable: true,
              },
              first_name: {
                type: 'string',
                example: 'Иван',
                nullable: true,
              },
              last_name: {
                type: 'string',
                example: 'Иванов',
                nullable: true,
              },
              is_superuser: {
                type: 'boolean',
                example: false,
                nullable: true,
              },
              last_login: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00Z',
                nullable: true,
              },
            },
          },
        },
      },
    }),
    // Ошибки
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации данных',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['Некорректный email', 'Пароль не может быть пустым']
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Неверный API ключ или отсутствие заголовков аутентификации',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Неверный API ключ' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Доступ запрещен для данного домена',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Доступ запрещен для домена' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Пользователь не найден' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Внутренняя ошибка сервера',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Ошибка аутентификации: Connection timeout' },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
};
