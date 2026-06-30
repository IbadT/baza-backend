import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TireProductsService } from './tire-products.service';
import { WheelProductsService } from './wheel-products.service';
import { AccessoriesProductsService } from './accessories-products.service';
import { PhotoAttacherService } from './photo-attacher.service';
import { JwtAuthModule } from 'src/jwt/jwt.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [JwtAuthModule, DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    TireProductsService,
    WheelProductsService,
    AccessoriesProductsService,
    PhotoAttacherService,
  ],
})
export class ProductsModule {}
