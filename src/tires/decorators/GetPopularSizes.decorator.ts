import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetPopularSizesApiDocs = () => {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Эндпоинт для получения популярных размеров шин',
      description:
        'Возвращает список популярных размеров шин, сгруппированных по диаметру, с информацией о ширине, соотношении сторон и популярности каждого размера.',
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
      description: 'Успешное получение популярных размеров шин',
      schema: {
        type: 'object',
        properties: {
          popularSizes: {
            type: 'array',
            description: 'Массив популярных размеров шин',
            items: {
              type: 'object',
              properties: {
                diameter: {
                  type: 'number',
                  description: 'Диаметр колеса в дюймах',
                  example: 17,
                },
                sizes: {
                  type: 'array',
                  description: 'Массив размеров для данного диаметра',
                  items: {
                    type: 'object',
                    properties: {
                      width: {
                        type: 'number',
                        description: 'Ширина шины в миллиметрах',
                        example: 205,
                      },
                      aspectRatio: {
                        type: 'number',
                        description:
                          'Соотношение высоты к ширине шины в процентах',
                        example: 55,
                      },
                      popularity: {
                        type: 'number',
                        description: 'Показатель популярности размера (0-100)',
                        example: 85,
                      },
                    },
                  },
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
    // ApiResponse({
    //     status: HttpStatus.UNAUTHORIZED,
    //     description: "Неверный API ключ или отсутствие заголовков аутентификации",
    //     schema: {
    //         type: "object",
    //         properties: {
    //             statusCode: {
    //                 type: "number",
    //                 example: 401
    //             },
    //             message: {
    //                 type: "string",
    //                 example: "Unauthorized"
    //             }
    //         }
    //     }
    // }),
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
