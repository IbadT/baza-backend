import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
// import { ThrottlerModule } from '@nestjs/throttler';
// import { CustomThrottlerGuard } from './guards/throttler.guard';
import { ProductsModule } from './products/products.module';
// import { RedisModule } from '@nestjs-modules/ioredis';
import { TiresModule } from './tires/tires.module';
import { XDomainMiddleware } from './middlewares/x-domain.middleware';
import { SentryModule } from '@sentry/nestjs/setup';
import { JwtAuthModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'default',
    //     ttl: 60000,
    //     limit: 10,
    //   },
    //   {
    //     name: 'login',
    //     ttl: 900000,
    //     limit: 5,
    //   },
    // ]),
    LoggerModule,
    DatabaseModule,
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'single',
    //     url: configService.getOrThrow<string>('REDIS_URL'),
    //     options: {
    //       lazyConnect: true,
    //       retryStrategy: (times) => Math.min(times * 50, 2000),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    SentryModule.forRoot(),
    JwtAuthModule,
    ProductsModule,
    TiresModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XDomainMiddleware).forRoutes('*path');
  }
}
