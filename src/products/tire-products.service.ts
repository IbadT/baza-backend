import { Injectable } from '@nestjs/common';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
import { AppLogger } from 'src/logger/logger.service';
import { PhotoAttacherService } from './photo-attacher.service';
import { ProductRepository } from 'src/database/repositories/product.repository';

@Injectable()
export class TireProductsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly photoAttacher: PhotoAttacherService,
    private readonly productRepo: ProductRepository,
  ) {}

  async findTireProducts(query: GetProductQueryDTO, userId: string) {
    const { page = 1, limit = 20, sortBy = 'price_asc' } = query;
    const offset = (page - 1) * limit;

    this.logger.log('TireProducts: запрос к БД...', 'TireProductsService');

    const { rows, total } = await this.productRepo.findProducts(
      'tires',
      {
        brand: query.brand,
        spikes: query.spikes,
        runFlat: query.runFlat,
        season: query.season,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        minQuantity: query.minQuantity,
        treadPattern: query.treadPattern,
        width1: query.width1,
        height1: query.height1,
        diameter1: query.diameter1,
        width2: query.width2,
        height2: query.height2,
        diameter2: query.diameter2,
      },
      { offset, limit },
      sortBy,
      userId,
    );

    this.logger.log(
      `TireProducts: получено ${rows.length} записей из БД`,
      'TireProductsService',
    );

    const data = await this.photoAttacher.attachPhotosToProducts(rows);
    this.logger.log('TireProducts: фото присоединены', 'TireProductsService');

    const response = {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      count: rows.length,
      success: true,
      data,
    };

    this.logger.log('TireProducts: ответ готов', 'TireProductsService');
    return response;
  }
}
