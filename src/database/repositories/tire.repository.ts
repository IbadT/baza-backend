import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database.service';

export interface TireSizeRecord {
  Diameter: number;
  Width: number;
  AspectRatio: number;
  Popularity: number;
}

export interface BrandRecord {
  ID: number;
  Name: string;
  Popularity: number;
}

export interface ModelRecord {
  ID: number;
  ModelName: string;
  Season: number;
  SeasonName: string;
  rn: number;
}

@Injectable()
export class TireRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPopularSizes(
    minDiameter: number,
    maxDiameter: number,
    limitPerDiameter: number,
  ): Promise<TireSizeRecord[]> {
    const pool = this.databaseService.getPool();
    const result = await pool
      .request()
      .input('minDiameter', sql.Int, minDiameter)
      .input('maxDiameter', sql.Int, maxDiameter)
      .input('limitPerDiameter', sql.Int, limitPerDiameter).query(`
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
        SELECT Diameter, Width, AspectRatio, Popularity
        FROM RankedSizes
        WHERE rn <= @limitPerDiameter
        ORDER BY Diameter ASC, Popularity DESC
      `);
    return result.recordset as TireSizeRecord[];
  }

  async findPopularBrands(limit: number): Promise<BrandRecord[]> {
    const pool = this.databaseService.getPool();
    const result = await pool.request().input('limit', sql.Int, limit).query(`
        SELECT TOP (@limit) v.ID, v.Name, COUNT(pa.ProductID) as Popularity
        FROM Vendors v
        JOIN Categories c ON c.ID = v.CategoryID
        JOIN Models m ON m.VendorID = v.ID
        JOIN Products p ON p.ModelID = m.ID
        LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
        WHERE c.URL = 'tires'
          AND pa.ProductID IS NOT NULL
        GROUP BY v.ID, v.Name
        ORDER BY COUNT(pa.ProductID) DESC
      `);
    return result.recordset as BrandRecord[];
  }

  async findBrandBySlug(
    brandId: string,
  ): Promise<{ ID: number; Name: string } | null> {
    const pool = this.databaseService.getPool();
    const result = await pool
      .request()
      .input('brandId', sql.VarChar, brandId.toLowerCase()).query(`
        SELECT v.ID, v.Name
        FROM Vendors v
        JOIN Categories c ON c.ID = v.CategoryID
        WHERE c.URL = 'tires'
          AND (LOWER(REPLACE(v.Name, ' ', '-')) = @brandId OR LOWER(v.Name) = @brandId)
      `);
    return (result.recordset[0] as { ID: number; Name: string }) ?? null;
  }

  async findBrandModels(vendorId: number): Promise<ModelRecord[]> {
    const pool = this.databaseService.getPool();
    const result = await pool.request().input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT
          m.ID as ModelID,
          m.Name as ModelName,
          COUNT(pa.ProductID) as ProductCount,
          pa.Season,
          CASE
            WHEN pa.Season = 0 THEN 'summer'
            WHEN pa.Season = 1 THEN 'winter'
            WHEN pa.Season = 2 THEN 'all-season'
            ELSE ''
          END as SeasonName,
          ROW_NUMBER() OVER (PARTITION BY m.ID ORDER BY COUNT(pa.ProductID) DESC) as rn
        FROM Models m
        JOIN Products p ON p.ModelID = m.ID
        LEFT JOIN PriceActual pa ON pa.ProductID = p.ID
        WHERE m.VendorID = @vendorId
          AND pa.ProductID IS NOT NULL
        GROUP BY m.ID, m.Name, pa.Season
      `);
    return result.recordset as ModelRecord[];
  }
}
