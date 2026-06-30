import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ProductRepository } from './repositories/product.repository';
import { TireRepository } from './repositories/tire.repository';
import { AuthRepository } from './repositories/auth.repository';
import { PhotoRepository } from './repositories/photo.repository';

@Global()
@Module({
  providers: [
    DatabaseService,
    ProductRepository,
    TireRepository,
    AuthRepository,
    PhotoRepository,
  ],
  exports: [
    DatabaseService,
    ProductRepository,
    TireRepository,
    AuthRepository,
    PhotoRepository,
  ],
})
export class DatabaseModule {}
