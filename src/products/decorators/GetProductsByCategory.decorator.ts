import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const GetProductsByCategoryApiDocs = () => {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Получение товаров по категории',
      description: `
Получение товаров по категории с поддержкой фильтрации, сортировки и пагинации.

**Поддерживаемые категории:**
- \`tires\` - шины
- \`wheels\` - диски  

**Фильтры для шин:**
- Размеры (width, height, diameter)
- Бренды (brand)
- Сезонность (season)
- Цена (priceMin, priceMax)
- Количество (minQuantity)
- Дополнительные характеристики (spikes, runFlat, treadPattern)

**Сортировка:**
- \`price_asc\` - по цене (возрастание)
- \`price_desc\` - по цене (убывание)
- \`rating_desc\` - по рейтингу
- \`newest\` - по дате добавления

Система автоматически проверяет Redis кэш и возвращает данные из кэша при наличии.
      `,
    }),
    ApiHeader({
      name: 'X-Domain',
      description:
        'Домен для фильтрации данных (например: domain.ru, domain.by)',
      required: true,
      example: 'domain.ru',
    }),
    ApiHeader({
      name: 'X-API-Key',
      description: 'Секретный ключ домена для авторизации',
      required: true,
      example: 'test-api-key-123',
    }),
    // Основные параметры
    ApiQuery({
      name: 'category',
      enum: ['tires', 'wheels', 'accessories'],
      required: true,
      description: 'Категория товаров для фильтрации',
      example: 'tires',
    }),
    ApiQuery({
      name: 'page',
      type: Number,
      required: true,
      description: 'Номер страницы (начиная с 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: true,
      description: 'Количество товаров на странице',
      example: 10,
    }),
    ApiQuery({
      name: 'sortdBy',
      enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'],
      required: false,
      description: 'Способ сортировки результатов',
      example: 'price_asc',
    }),
    // Фильтры для шин
    ApiQuery({
      name: 'width1',
      type: Number,
      required: false,
      description: 'Ширина шины (мм)',
      example: 205,
    }),
    ApiQuery({
      name: 'height1',
      type: Number,
      required: false,
      description: 'Высота профиля шины (%)',
      example: 55,
    }),
    ApiQuery({
      name: 'diameter1',
      type: Number,
      required: false,
      description: 'Диаметр обода (дюймы)',
      example: 16,
    }),
    ApiQuery({
      name: 'brand',
      type: [String],
      required: false,
      description: 'Бренды шин (можно передать массив или строку)',
      example: ['Michelin', 'Pirelli'],
    }),
    ApiQuery({
      name: 'season',
      type: [String],
      required: false,
      description: 'Сезонность шин (summer, winter, all-season)',
      example: ['summer', 'winter'],
    }),
    ApiQuery({
      name: 'priceMin',
      type: Number,
      required: false,
      description: 'Минимальная цена',
      example: 5000,
    }),
    ApiQuery({
      name: 'priceMax',
      type: Number,
      required: false,
      description: 'Максимальная цена',
      example: 20000,
    }),
    ApiQuery({
      name: 'spikes',
      type: Boolean,
      required: false,
      description: 'Шипы (true/false)',
      example: true,
    }),
    ApiQuery({
      name: 'runFlat',
      type: Boolean,
      required: false,
      description: 'RunFlat технология (true/false)',
      example: false,
    }),
    ApiQuery({
      name: 'minQuantity',
      type: Number,
      required: false,
      description: 'Минимальное количество на складе',
      example: 2,
    }),
    // Успешный ответ
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Успешное получение товаров',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-123' },
                productId: { type: 'number', example: 123 },
                customerId: { type: 'number', example: 456 },
                customerName: { type: 'string', example: 'Поставщик А' },
                category: { type: 'string', example: 'Шины' },
                categoryId: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Pilot Sport 4' },
                price: { type: 'number', example: 8500 },
                quantity: { type: 'number', example: 10 },
                reserved: { type: 'number', example: 2 },
                customerPoint: { type: 'string', example: 'Склад 1' },
                code: { type: 'string', example: 'PS4-205-55-16' },
                season: { type: 'string', example: 'summer' },
                comment: { type: 'string', example: 'Летние шины' },
                model: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 123 },
                    name: { type: 'string', example: 'Pilot Sport 4' },
                    vendorId: { type: 'number', example: 789 },
                    photos: { 
                      type: 'array', 
                      items: { type: 'string' },
                      example: ['photo1.jpg', 'photo2.jpg']
                    },
                  },
                },
              },
            },
          },
          count: {
            type: 'number',
            description: 'Количество товаров на текущей странице',
            example: 10,
          },
          page: {
            type: 'number',
            description: 'Текущая страница',
            example: 1,
          },
          limit: {
            type: 'number',
            description: 'Количество товаров на странице',
            example: 10,
          },
          totalPages: {
            type: 'number',
            description: 'Общее количество страниц',
            example: 5,
          },
        },
      },
    }),
    // Ошибки
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации параметров',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Выбрана неверная категория' },
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
          message: { type: 'string', example: 'Пользователь не авторизован' },
          error: { type: 'string', example: 'Unauthorized' },
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
          message: { type: 'string', example: 'Internal server error' },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
};
