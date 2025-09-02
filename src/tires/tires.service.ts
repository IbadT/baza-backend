import { Injectable } from '@nestjs/common';
import {
  IResponsePopularBrandModels,
  IResponsePopularBrands,
  IResponsePopularSize,
} from './types/types';
import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { GetPupularSizesQueryDTO } from './dto/get-popular-sizes.dto';
import * as sql from 'mssql';

interface TireSizeRecord {
  Diameter: number;
  Width: number;
  AspectRatio: number;
  Popularity: number;
}

interface BrandRecord {
  ID: number;
  Name: string;
  Popularity: number;
}

interface ModelRecord {
  ID: number;
  ModelName: string;
  Season: number;
  SeasonName: string;
  rn: number;
}

@Injectable()
export class TiresService {
  constructor(
    private readonly cache: CacheService,
    private readonly configSerice: ConfigService,
  ) {}

  private get config() {
    return {
      server: this.configSerice.getOrThrow<string>('DB_HOST'),
      database: this.configSerice.getOrThrow<string>('DB_DATABASE'),
      user: this.configSerice.getOrThrow<string>('DB_USERNAME'),
      password: this.configSerice.getOrThrow<string>('DB_PASSWORD'),
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
  }

  async findAllPopularSize(
    query: GetPupularSizesQueryDTO,
    xDomain: string,
  ): Promise<IResponsePopularSize | null> {
    const cacheKey = 'popular-sizes';
    const params = { ...query, xDomain };

    const cachedData = (await this.cache.get(
      cacheKey,
      params.minDiameter,
      params.maxDiameter,
      params.limitPerDiameter || 'default',
      xDomain,
    )) as IResponsePopularSize;
    if (cachedData) return cachedData;

    const limitPerDiameter = query.limitPerDiameter || 5;

    const queryString = `
      WITH RankedSizes AS (
        SELECT 
          Diameter,
          Width,
          Height as AspectRatio,
          TotalCount as Popularity,
          ROW_NUMBER() OVER (PARTITION BY Diameter ORDER BY TotalCount DESC) as rn
        FROM TireTypesizesCube
        WHERE Diameter BETWEEN @minDiameter AND @maxDiameter
          AND Height IS NOT NULL
          AND TotalCount > 0
      )
      SELECT 
        Diameter,
        Width,
        AspectRatio,
        Popularity
      FROM RankedSizes
      WHERE rn <= @limitPerDiameter
      ORDER BY Diameter ASC, Popularity DESC
    `;

    const pool = await sql.connect(this.config);
    const result = await pool
      .request()
      .input('minDiameter', sql.Int, query.minDiameter)
      .input('maxDiameter', sql.Int, query.maxDiameter)
      .input('limitPerDiameter', sql.Int, limitPerDiameter)
      .query(queryString);

    // Transform the flat result into the required nested structure
    const diametersMap = new Map<number, { diameter: number; sizes: any[] }>();

    (result.recordset as TireSizeRecord[]).forEach((row) => {
      const diameter = parseInt(String(row.Diameter));
      if (!diametersMap.has(diameter)) {
        diametersMap.set(diameter, {
          diameter,
          sizes: [],
        });
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

    await this.cache.set(
      {
        baseKey: cacheKey,
        ttl: Number(
          this.configSerice.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
        ),
        value: response,
      },
      params.minDiameter,
      params.maxDiameter,
      params.limitPerDiameter || 'default',
      xDomain,
    );

    return response;
  }

  async findAllPopularBrands(
    limit: number,
    xDomain: string,
  ): Promise<IResponsePopularBrands | null> {
    const cacheKey = 'popular-brands';

    const cachedData = (await this.cache.get(
      cacheKey,
      limit,
      xDomain,
    )) as IResponsePopularBrands;
    if (cachedData) return cachedData;

    const queryString = `
      SELECT TOP (@limit)
        v.ID,
        v.Name,
        COUNT(pa.ProductID) as Popularity
      FROM Vendors v
      JOIN Categories c ON c.ID = v.CategoryID
      JOIN Models m ON m.VendorID = v.ID
      JOIN Products p ON p.ModelID = m.ID
      LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
      WHERE c.URL = 'tires'
        AND pa.ProductID IS NOT NULL
      GROUP BY v.ID, v.Name
      ORDER BY COUNT(pa.ProductID) DESC
    `;

    const pool = await sql.connect(this.config);
    const result = await pool
      .request()
      .input('limit', sql.Int, limit)
      .query(queryString);

    // Transform the result into the required format
    const popularBrands = (result.recordset as BrandRecord[]).map((row) => ({
      id: row.Name.toLowerCase().replace(/\s+/g, '-'),
      name: row.Name,
      popularity: row.Popularity,
      logoUrl: `/brands/${row.Name.toLowerCase().replace(/\s+/g, '-')}.png`,
    }));

    const response: IResponsePopularBrands = {
      popularBrands,
    };

    await this.cache.set(
      {
        baseKey: cacheKey,
        ttl: Number(
          this.configSerice.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
        ),
        value: response,
      },
      limit,
      xDomain,
    );

    return response;
  }

  async findAllPopularBrandModels(
    brandId: string,
    xDomain: string,
  ): Promise<IResponsePopularBrandModels | null> {
    const cacheKey = 'brand-models';

    const cachedData = (await this.cache.get(
      cacheKey,
      brandId,
      xDomain,
    )) as IResponsePopularBrandModels;
    if (cachedData) return cachedData;

    const pool = await sql.connect(this.config);

    // First, get the brand information
    const brandQuery = `
      SELECT v.ID, v.Name
      FROM Vendors v
      JOIN Categories c ON c.ID = v.CategoryID
      WHERE c.URL = 'tires' 
        AND (LOWER(REPLACE(v.Name, ' ', '-')) = @brandId OR LOWER(v.Name) = @brandId)
    `;

    const brandResult = await pool
      .request()
      .input('brandId', sql.VarChar, brandId.toLowerCase())
      .query(brandQuery);

    if (brandResult.recordset.length === 0) {
      return null;
    }

    const brand = brandResult.recordset[0] as { ID: number; Name: string };

    const modelsQuery = `
      SELECT 
        m.ID as ModelID,
        m.Name as ModelName,
        COUNT(pa.ProductID) as ProductCount,
        pa.Season,
        CASE 
          WHEN pa.Season = 0 THEN 'summer'
          WHEN pa.Season = 1 THEN 'winter'
          WHEN pa.Season = 2 THEN 'all-season'
          ELSE 'unknown'
        END as SeasonName,
        ROW_NUMBER() OVER (PARTITION BY m.ID ORDER BY COUNT(pa.ProductID) DESC) as rn
      FROM Models m
      JOIN Products p ON p.ModelID = m.ID
      LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
      WHERE m.VendorID = @vendorId
        AND pa.ProductID IS NOT NULL
      GROUP BY m.ID, m.Name, pa.Season
    `;

    const modelsResult = await pool
      .request()
      .input('vendorId', sql.Int, brand.ID)
      .query(modelsQuery);

    const uniqueModels = (modelsResult.recordset as ModelRecord[])
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

    const response: IResponsePopularBrandModels = {
      brand: {
        id: brand.Name.toLowerCase().replace(/\s+/g, '-'),
        name: brand.Name,
        logoUrl: `/brands/${brand.Name.toLowerCase().replace(/\s+/g, '-')}.png`,
      },
      models: uniqueModels,
    };

    await this.cache.set(
      {
        baseKey: cacheKey,
        ttl: Number(
          this.configSerice.getOrThrow<string>('REDIS_DEFAULT_PRODUCTS_TTL'),
        ),
        value: response,
      },
      brandId,
      xDomain,
    );

    return response;
  }
}
