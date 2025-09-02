import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetPopularBrandModelsApiDocs = () => {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Эндпоинт для получения моделей шин производителя',
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
      description: '',
      schema: {
        type: 'object',
        properties: {
          brand: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Идентификатор бренда',
                example: 'michelin',
              },
              name: {
                type: 'string',
                description: 'Название бренда',
                example: 'Michelin',
              },
              logoUrl: {
                type: 'string',
                description: 'URL логотипа',
                example: '/brands/michelin.png',
              },
            },
          },
          models: {
            type: 'array',
            description: 'Массив объектов с информацией о моделях',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Уникальный идентификатор модели',
                  example: 'pilot-sport-4',
                },
                name: {
                  type: 'string',
                  description: 'Название модели',
                  example: 'Primacy 4',
                },
                logoUrl: {
                  type: 'string',
                  description: 'URL изображения модели',
                  example: '/models/primacy-4.jpg',
                },
                // !!! не совпадает с описанием, в описании categories
                season: {
                  type: 'string',
                  description: 'Сезонность модели',
                  example: 'summer',
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
