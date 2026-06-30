import { Injectable } from '@nestjs/common';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
import { AppLogger } from 'src/logger/logger.service';
import { PhotoAttacherService } from './photo-attacher.service';
import { ProductRepository } from 'src/database/repositories/product.repository';

@Injectable()
export class WheelProductsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly photoAttacher: PhotoAttacherService,
    private readonly productRepo: ProductRepository,
  ) {}

  async findWheelProducts(query: GetProductQueryDTO, userId: string) {
    const { page = 1, limit = 20, sortBy = 'price_asc' } = query;
    const offset = (page - 1) * limit;

    this.logger.log('WheelProducts: запрос к БД...', 'WheelProductsService');

    const { rows, total } = await this.productRepo.findProducts(
      'wheels',
      {
        brand: query.brand,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        minQuantity: query.minQuantity,
      },
      { offset, limit },
      sortBy,
      userId,
    );

    this.logger.log(
      `WheelProducts: получено ${rows.length} записей из БД`,
      'WheelProductsService',
    );

    const data = await this.photoAttacher.attachPhotosToProducts(rows);
    this.logger.log('WheelProducts: фото присоединены', 'WheelProductsService');

    const response = {
      count: rows.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      success: true,
      data,
    };

    return response;
  }
}
