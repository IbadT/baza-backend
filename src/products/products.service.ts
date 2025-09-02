import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/cache/cacheService.service';
import { IResponseRows } from './types/types';
import { GetProductQueryDTO } from './dto/get-product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {}

  private get config() {
    return {
      server: this.configService.getOrThrow<string>('DB_HOST'),
      database: this.configService.getOrThrow<string>('DB_DATABASE'),
      user: this.configService.getOrThrow<string>('DB_USERNAME'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
  }

  async findAllProductsByCategory(
    query: GetProductQueryDTO,
    xDomain: string,
  ): Promise<IResponseRows | null> {
    const { category, page, limit, sortdBy = 'price_asc' } = query;

    if (category === 'tires') {
      return this.findTireProducts(query, xDomain);
    }

    if (category === 'wheels') {
      return this.findWheelProducts(query, xDomain);
    }

    // const cacheKey = 'products-by-category';

    // const cachedData = (await this.cache.get(
    //   cacheKey,
    //   category,
    //   page,
    //   limit,
    //   sortdBy,
    //   xDomain,
    // )) as any;
    // if (cachedData) return cachedData;

    const offset = (page - 1) * limit;

    let orderByClause = '';
    switch (sortdBy) {
      case 'price_asc':
        orderByClause = 'ORDER BY pa.WholePrice ASC';
        break;
      case 'price_desc':
        orderByClause = 'ORDER BY pa.WholePrice DESC';
        break;
      case 'rating_desc':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.ID ASC';
    }

    const queryString = `
      SELECT 
        p.ID,
        p.ModelID,
        p.AdditionalSpecifications,
        p.Specifications,
        m.Name as ModelName,
        v.Name as VendorName,
        c.Name as CategoryName,
        c.URL as CategoryURL,
        pa.Vendor as PriceVendor,
        pa.ModelName as PriceModelName,
        pa.FullSizeCaption,
        pa.AdditionalSpecifications as PriceAdditionalSpecs,
        pa.Season,
        pa.Indexes,
        pa.Runflat,
        pa.Spikes,
        pa.WholePrice,
        pa.Quantity
      FROM Products p
      JOIN Models m ON m.ID = p.ModelID
      JOIN Vendors v ON v.ID = m.VendorID
      JOIN Categories c ON c.ID = v.CategoryID
      LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
      WHERE c.URL = @category
      ${orderByClause}
      OFFSET @offset ROWS 
      FETCH NEXT @limit ROWS ONLY
    `;

    const pool = await sql.connect(this.config);
    const result = await pool
      .request()
      .input('category', sql.VarChar, category)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(queryString);

    const response = {
      count: result.recordset.length,
      page,
      limit,
      totalPages: Math.ceil(result.recordset.length / limit),
      success: true,
      data: result.recordset,
    };

    // await this.cache.set(
    //   {
    //     baseKey: cacheKey,
    //     ttl: Number(
    //       this.configService.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
    //     ),
    //     value: response,
    //   },
    //   category,
    //   page,
    //   limit,
    //   sortdBy,
    //   xDomain,
    // );

    return response;
  }

  private async findTireProducts<T>(
    query: GetProductQueryDTO,
    xDomain: string,
  ) {
    const { page, limit, sortdBy = 'price_asc' } = query;

    const brand = typeof query.brand === 'string' ? [query.brand] : query.brand;
    const season =
      typeof query.season === 'string' ? [query.season] : query.season;
    const offset = (page - 1) * limit;

    const cacheKey = 'tire-products';
    const cacheParams = [
      'tires',
      page,
      limit,
      sortdBy,
      xDomain,
      Array.isArray(brand) ? brand.join(',') : brand,
      query.spikes?.toString(),
      query.runFlat?.toString(),
      Array.isArray(season) ? season.join(',') : season,
      query.priceMin,
      query.priceMax,
      query.minQuantity,
      query.width1,
      query.height1,
      query.diameter1,
      query.width2,
      query.height2,
      query.diameter2,
    ].filter((param): param is string | number => param !== undefined);

    const cachedData = (await this.cache.get(cacheKey, ...cacheParams)) as T;
    if (cachedData) return cachedData;

    let orderByClause = '';
    switch (sortdBy) {
      case 'price_asc':
        orderByClause =
          'ORDER BY CASE WHEN pa.WholePrice IS NULL THEN 1 ELSE 0 END, pa.WholePrice ASC';
        break;
      case 'price_desc':
        orderByClause =
          'ORDER BY CASE WHEN pa.WholePrice IS NULL THEN 1 ELSE 0 END, pa.WholePrice DESC';
        break;
      case 'rating_desc':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.ID ASC';
    }

    const whereConditions = ['c.URL = @category'];
    const params: any[] = [];

    if (brand && Array.isArray(brand) && brand.length > 0) {
      const brandParams = brand.map((_, index) => `@brand${index}`).join(',');
      whereConditions.push(`v.Name IN (${brandParams})`);
    }

    if (query.spikes !== undefined) {
      whereConditions.push('pa.Spikes = @spikes');
    }

    if (query.runFlat !== undefined) {
      whereConditions.push('pa.Runflat = @runFlat');
    }

    if (season && Array.isArray(season) && season.length > 0) {
      const seasonMap: { [key: string]: number } = {
        summer: 0,
        winter: 1,
        allseason: 2,
      };
      const seasonValues = season.map((s) => seasonMap[s] ?? 0);
      const seasonParams = seasonValues
        .map((_, index) => `@season${index}`)
        .join(',');
      whereConditions.push(`pa.Season IN (${seasonParams})`);
    }

    if (query.priceMin !== undefined) {
      whereConditions.push('pa.WholePrice >= @priceMin');
    }

    if (query.priceMax !== undefined) {
      whereConditions.push('pa.WholePrice <= @priceMax');
    }

    if (query.minQuantity !== undefined) {
      whereConditions.push('pa.Quantity >= @minQuantity');
    }

    if (
      query.width1 ||
      query.height1 ||
      query.diameter1 ||
      query.width2 ||
      query.height2 ||
      query.diameter2
    ) {
      whereConditions.push('pa.FullSizeCaption IS NOT NULL');
    }

    const queryString = `
        SELECT 
          p.ID,
          p.ModelID,
          p.AdditionalSpecifications,
          p.Specifications,
          m.Name as ModelName,
          v.Name as VendorName,
          c.Name as CategoryName,
          c.URL as CategoryURL,
          pa.Vendor as PriceVendor,
          pa.ModelName as PriceModelName,
          pa.FullSizeCaption,
          pa.AdditionalSpecifications as PriceAdditionalSpecs,
          pa.Season,
          pa.Indexes,
          pa.Runflat,
          pa.Spikes,
          pa.WholePrice,
          pa.Quantity
        FROM Products p
        JOIN Models m ON m.ID = p.ModelID
        JOIN Vendors v ON v.ID = m.VendorID
        JOIN Categories c ON c.ID = v.CategoryID
        LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
        WHERE ${whereConditions.join(' AND ')}
        ${orderByClause}
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `;

    const pool = await sql.connect(this.config);
    const request = pool
      .request()
      .input('category', sql.VarChar, 'tires')
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit);

    if (query.spikes !== undefined) {
      request.input('spikes', sql.Bit, query.spikes);
    }
    if (query.runFlat !== undefined) {
      request.input('runFlat', sql.Bit, query.runFlat);
    }
    if (query.priceMin !== undefined) {
      request.input('priceMin', sql.Float, query.priceMin);
    }
    if (query.priceMax !== undefined) {
      request.input('priceMax', sql.Float, query.priceMax);
    }
    if (query.minQuantity !== undefined) {
      request.input('minQuantity', sql.Int, query.minQuantity);
    }

    // Add brand parameters
    if (brand && Array.isArray(brand) && brand.length > 0) {
      brand.forEach((brandName, index) => {
        request.input(`brand${index}`, sql.VarChar, brandName);
      });
    }

    // Add season parameters
    if (season && Array.isArray(season) && season.length > 0) {
      const seasonMap: { [key: string]: number } = {
        summer: 0,
        winter: 1,
        allseason: 2,
      };
      const seasonValues = season.map((s) => seasonMap[s] ?? 0);
      seasonValues.forEach((seasonValue, index) => {
        request.input(`season${index}`, sql.Int, seasonValue);
      });
    }

    params.forEach((param, index) => {
      request.input(`param${index}`, sql.VarChar, param);
    });

    const result = await request.query(queryString);

    const response = {
      success: true,
      data: result.recordset,
      count: result.recordset.length,
      page,
      limit,
      totalPages: Math.ceil(result.recordset.length / limit),
    };

    await this.cache.set(
      {
        baseKey: cacheKey,
        ttl: Number(
          this.configService.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
        ),
        value: response,
      },
      ...cacheParams,
    );

    return response;
  }

  private async findWheelProducts<T>(
    query: GetProductQueryDTO,
    xDomain: string,
  ) {
    const { page, limit, sortdBy = 'price_asc' } = query;
    const offset = (page - 1) * limit;

    const cacheKey = 'wheel-products';
    const cacheParams = ['wheels', page, limit, sortdBy, xDomain].filter(
      (param): param is string | number => param !== undefined,
    );

    const cachedData = (await this.cache.get(cacheKey, ...cacheParams)) as T;
    if (cachedData) return cachedData;

    let orderByClause = '';
    switch (sortdBy) {
      case 'price_asc':
      case 'price_desc':
        orderByClause = 'ORDER BY p.ID ASC'; // No price data for wheels
        break;
      case 'rating_desc':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.ID ASC';
    }

    const queryString = `
      SELECT 
        p.ID,
        p.ModelID,
        p.AdditionalSpecifications,
        p.Specifications,
        m.Name as ModelName,
        v.Name as VendorName,
        c.Name as CategoryName,
        c.URL as CategoryURL,
        NULL as PriceVendor,
        NULL as PriceModelName,
        NULL as FullSizeCaption,
        NULL as PriceAdditionalSpecs,
        NULL as Season,
        NULL as Indexes,
        NULL as Runflat,
        NULL as Spikes,
        NULL as WholePrice,
        NULL as Quantity
      FROM Products p
      JOIN Models m ON m.ID = p.ModelID
      JOIN Vendors v ON v.ID = m.VendorID
      JOIN Categories c ON c.ID = v.CategoryID
      WHERE c.URL = 'wheels'
      ${orderByClause}
      OFFSET @offset ROWS 
      FETCH NEXT @limit ROWS ONLY
    `;

    const pool = await sql.connect(this.config);
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(queryString);

    const response = {
      count: result.recordset.length,
      page,
      limit,
      totalPages: Math.ceil(result.recordset.length / limit),
      success: true,
      data: result.recordset,
    };

    await this.cache.set(
      {
        baseKey: cacheKey,
        ttl: Number(
          this.configService.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
        ),
        value: response,
      },
      ...cacheParams,
    );

    return response;
  }
}
