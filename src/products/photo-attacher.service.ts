import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IProductModel } from './types/product.types';
import { AppLogger } from 'src/logger/logger.service';
import { PhotoRepository, ProductRawRow } from 'src/database/repositories';

@Injectable()
export class PhotoAttacherService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    private readonly photoRepo: PhotoRepository,
  ) {}

  async attachPhotosToProducts(
    rows: ProductRawRow[],
  ): Promise<IProductModel[]> {
    this.logger.log(
      `Присоединение фото к ${rows.length} продуктам`,
      'PhotoAttacherService',
    );
    const baseUrl =
      this.configService.get<string>('PHOTOS_BASE_URL') ||
      'https://example.com/images/';

    if (rows.length === 0) {
      return [];
    }

    const uniqueModelIds = [...new Set(rows.map((r) => r.modelId))];
    const photos = await this.photoRepo.findPhotosByModelIds(uniqueModelIds);

    this.logger.log(
      `Получено ${photos.length} фото для ${uniqueModelIds.length} моделей`,
      'PhotoAttacherService',
    );

    const photosMap = new Map<number, string[]>();
    for (const record of photos) {
      if (!photosMap.has(record.ModelId)) {
        photosMap.set(record.ModelId, []);
      }
      photosMap.get(record.ModelId)!.push(baseUrl + record.photoPath);
    }

    return rows.map((row) => ({
      id: String(row.id),
      productId: row.productId,
      customerId: row.customerId ?? 0,
      customerName: row.customerName ?? '',
      category: row.category,
      categoryId: row.categoryId,
      name: row.name,
      price: row.price ?? 0,
      quantity: row.quantity ?? 0,
      reserved: row.reserved ?? 0,
      customerPoint: row.customerPoint ?? '',
      code: row.code ?? '',
      season: row.season ?? '',
      comment: row.comment ?? '',
      model: {
        id: row.modelId,
        name: row.modelName,
        vendorId: row.vendorId,
        photos: photosMap.get(row.modelId) || [],
      },
    }));
  }
}
