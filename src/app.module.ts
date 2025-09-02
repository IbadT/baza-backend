import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TiresModule } from './tires/tires.module';
import { XDomainMiddleware } from './middlewares/x-domain.middleware';
import { SentryModule } from '@sentry/nestjs/setup';
import { JwtAuthModule } from './jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    SentryModule.forRoot(),
    JwtAuthModule,
    ProductsModule,
    TiresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XDomainMiddleware).forRoutes('*');
  }
}
