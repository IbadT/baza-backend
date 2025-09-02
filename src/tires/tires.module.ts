import { Module } from '@nestjs/common';
import { TiresService } from './tires.service';
import { TiresController } from './tires.controller';
import { CacheService } from 'src/cache/cacheService.service';
import { JwtAuthModule } from 'src/jwt/jwt.module';

@Module({
  imports: [JwtAuthModule],
  controllers: [TiresController],
  providers: [TiresService, CacheService],
})
export class TiresModule {}
