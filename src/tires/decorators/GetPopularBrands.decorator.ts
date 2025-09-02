import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetPopularBrandsApiDocs = () => {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Эндпоинт для получения популярных производителей шин',
    }),
    ApiHeader({
      name: 'X-Domain',
      description: 'Домен для фильтрации данных',
      required: true,
      example: 'domain.ru',
    }),
    ApiHeader({
      name: 'X-API-Key',
      description: 'Секретный ключ домена',
      required: true,
      example: 'your-secret-api-key',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          popularBrands: {
            type: 'array',
            description: 'Массив объектов с информацией о брендах',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Уникальный идентификатор бренда',
                  example: 'bridgestone',
                },
                name: {
                  type: 'string',
                  description: 'Название бренда',
                  example: 'Bridgestone',
                },
                popularity: {
                  type: 'stirng',
                  description: 'Показатель популярности (0-100)',
                  example: '78',
                },
                logoUrl: {
                  type: 'string',
                  description: 'URL логотипа бренда',
                  example: '/brands/bridgestone.png',
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации параметров',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          method: {
            type: 'string',
            enum: ['GET'],
            example: 'GET',
          },
          path: {
            type: 'string',
            example: '/api/tires/popular-sizes',
          },
          error: {
            type: 'string',
            example: 'Invalid parameters',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Внутренняя ошибка сервера',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Internal server error',
          },
        },
      },
    }),
  );
};
