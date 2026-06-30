import { Injectable } from '@nestjs/common';
import {
  IResponsePopularBrandModels,
  IResponsePopularBrands,
  IResponsePopularSize,
} from './types/types';
import { GetPopularSizesQueryDTO } from './dto/get-popular-sizes.dto';
import { AppLogger } from 'src/logger/logger.service';
import { TireRepository } from 'src/database/repositories/tire.repository';

@Injectable()
export class TiresService {
  constructor(
    private readonly logger: AppLogger,
    private readonly tireRepo: TireRepository,
  ) {}

  async findAllPopularSize(
    query: GetPopularSizesQueryDTO,
    _userId: string,
  ): Promise<IResponsePopularSize | null> {
    this.logger.log('PopularSizes: запрос к БД...', 'TiresService');

    const limitPerDiameter = query.limitPerDiameter || 5;

    const records = await this.tireRepo.findPopularSizes(
      query.minDiameter,
      query.maxDiameter,
      limitPerDiameter,
    );

    this.logger.log(
      `PopularSizes: получено ${records.length} записей из БД`,
      'TiresService',
    );

    const diametersMap = new Map<
      number,
      {
        diameter: number;
        sizes: { width: number; aspectRatio: number; popularity: number }[];
      }
    >();

    records.forEach((row) => {
      const diameter = parseInt(String(row.Diameter));
      if (!diametersMap.has(diameter)) {
        diametersMap.set(diameter, { diameter, sizes: [] });
      }
      diametersMap.get(diameter)!.sizes.push({
        width: parseInt(String(row.Width)),
        aspectRatio: parseInt(String(row.AspectRatio)),
        popularity: row.Popularity,
      });
    });

    const response: IResponsePopularSize = {
      popularSizes: Array.from(diametersMap.values()).sort(
        (a, b) => a.diameter - b.diameter,
      ),
    };
    this.logger.log(
      `PopularSizes: сгруппировано по ${response.popularSizes.length} диаметрам`,
      'TiresService',
    );

    return response;
  }

  async findAllPopularBrands(
    limit: number,
    _userId: string,
  ): Promise<IResponsePopularBrands | null> {
    this.logger.log('PopularBrands: запрос к БД...', 'TiresService');

    const records = await this.tireRepo.findPopularBrands(limit);

    this.logger.log(
      `PopularBrands: получено ${records.length} брендов из БД`,
      'TiresService',
    );

    const popularBrands = records.map((row) => ({
      id: row.Name.toLowerCase().replace(/\s+/g, '-'),
      name: row.Name,
      popularity: row.Popularity,
      logoUrl: `/brands/${row.Name.toLowerCase().replace(/\s+/g, '-')}.png`,
    }));

    return { popularBrands };
  }

  async findAllPopularBrandModels(
    brandId: string,
    _userId: string,
  ): Promise<IResponsePopularBrandModels | null> {
    this.logger.log(
      `BrandModels: запрос к БД для brandId=${brandId}...`,
      'TiresService',
    );

    const brand = await this.tireRepo.findBrandBySlug(brandId);

    if (!brand) {
      this.logger.warn(
        `BrandModels: бренд не найден для brandId=${brandId}`,
        'TiresService',
      );
      return null;
    }

    const models = await this.tireRepo.findBrandModels(brand.ID);

    this.logger.log(
      `BrandModels: получено ${models.length} моделей из БД`,
      'TiresService',
    );

    const uniqueModels = models
      .filter((row) => parseInt(String(row.rn)) === 1)
      .map((row) => ({
        id: row.ModelName.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        name: row.ModelName,
        imageUrl: `/models/${row.ModelName.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')}.jpg`,
        season: row.SeasonName,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      brand: {
        id: brand.Name.toLowerCase().replace(/\s+/g, '-'),
        name: brand.Name,
        logoUrl: `/brands/${brand.Name.toLowerCase().replace(/\s+/g, '-')}.png`,
      },
      models: uniqueModels,
    };
  }
}
