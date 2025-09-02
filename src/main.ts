import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = new ConfigService();

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(new ValidationPipe());

  // Глобальный фильтр для обработки всех ошибок в едином формате
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [configService.getOrThrow<string>('BASE_URL')],
  });

  const config = new DocumentBuilder()
    .setTitle('Backend for BAZA-shop')
    .setDescription('API для работы с товарами и шинами')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(configService.getOrThrow<string>('PORT') ?? 3000);
}
void bootstrap();
