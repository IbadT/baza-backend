import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CacheService } from 'src/cache/cacheService.service';
import { JwtAuthModule } from 'src/jwt/jwt.module';

@Module({
  imports: [JwtAuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, CacheService],
})
export class ProductsModule {}
