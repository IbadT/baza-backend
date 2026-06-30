import { Injectable } from '@nestjs/common';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
import { AppLogger } from 'src/logger/logger.service';
import { TireProductsService } from './tire-products.service';
import { WheelProductsService } from './wheel-products.service';
import { AccessoriesProductsService } from './accessories-products.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly tireProductsService: TireProductsService,
    private readonly wheelProductsService: WheelProductsService,
    private readonly accessoriesProductsService: AccessoriesProductsService,
  ) {}

  async findAllProductsByCategory(query: GetProductQueryDTO, userId: string) {
    const { category, page, limit, sortBy = 'price_asc' } = query;
    this.logger.log(
      `Запрос продуктов: category=${category}, page=${page}, limit=${limit}, sort=${sortBy}`,
      'ProductsService',
    );

    if (category === 'tires') {
      return this.tireProductsService.findTireProducts(query, userId);
    }

    if (category === 'wheels') {
      return this.wheelProductsService.findWheelProducts(query, userId);
    }

    if (category === 'accessories') {
      return this.accessoriesProductsService.findAccessoriesProducts(
        query,
        userId,
      );
    }

    return [];
  }
}
