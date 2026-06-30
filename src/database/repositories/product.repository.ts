import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database.service';

export interface ProductFilters {
  brand?: string[];
  spikes?: boolean;
  runFlat?: boolean;
  season?: string[];
  priceMin?: number;
  priceMax?: number;
  minQuantity?: number;
  treadPattern?: string;
  width1?: number;
  height1?: number;
  diameter1?: number;
  width2?: number;
  height2?: number;
  diameter2?: number;
}

export interface ProductRawRow {
  id: number;
  productId: number;
  customerId: number | null;
  customerName: string | null;
  category: string;
  categoryId: number;
  name: string;
  price: number | null;
  quantity: number | null;
  reserved: number | null;
  customerPoint: string | null;
  code: string | null;
  season: string | null;
  comment: string | null;
  modelId: number;
  modelName: string;
  vendorId: number;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findProducts(
    category: 'tires' | 'wheels' | 'accessories',
    filters: ProductFilters,
    pagination: { offset: number; limit: number },
    sortBy: string,
    userId?: string,
  ): Promise<{ rows: ProductRawRow[]; total: number }> {
    const pool = this.databaseService.getPool();

    const hasPriceActual = category === 'tires' || category === 'accessories';
    const hasTireSizes = category === 'tires';

    const priceCol = hasPriceActual
      ? 'COALESCE(pr.RetailPrice, pr.WholesalePrice, pa.WholePrice)'
      : 'COALESCE(pr.RetailPrice, pr.WholesalePrice)';

    let orderByClause = '';
    switch (sortBy) {
      case 'price_asc':
        orderByClause = `ORDER BY CASE WHEN ${priceCol} IS NULL THEN 1 ELSE 0 END, ${priceCol} ASC`;
        break;
      case 'price_desc':
        orderByClause = `ORDER BY CASE WHEN ${priceCol} IS NULL THEN 1 ELSE 0 END, ${priceCol} DESC`;
        break;
      case 'rating_desc':
      case 'newest':
        orderByClause = 'ORDER BY p.ID DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.ID ASC';
    }

    const whereConditions: string[] = ['c.URL = @category'];

    if (filters.brand?.length) {
      const brandParams = filters.brand.map((_, i) => `@brand${i}`).join(',');
      whereConditions.push(`v.Name IN (${brandParams})`);
    }
    if (hasPriceActual && filters.spikes !== undefined) {
      whereConditions.push('pa.Spikes = @spikes');
    }
    if (hasPriceActual && filters.runFlat !== undefined) {
      whereConditions.push('pa.Runflat = @runFlat');
    }
    if (hasPriceActual && filters.season?.length) {
      const seasonParams = filters.season
        .map((_, i) => `@season${i}`)
        .join(',');
      whereConditions.push(`pa.Season IN (${seasonParams})`);
    }
    if (filters.priceMin !== undefined) {
      whereConditions.push(`${priceCol} >= @priceMin`);
    }
    if (filters.priceMax !== undefined) {
      whereConditions.push(`${priceCol} <= @priceMax`);
    }
    if (filters.minQuantity !== undefined) {
      whereConditions.push('pr.Quantity >= @minQuantity');
    }
    if (hasTireSizes && filters.treadPattern !== undefined) {
      const treadPatternMap: Record<string, number> = {
        симметричный: 0,
        направленный: 1,
        асимметричный: 2,
      };
      if (treadPatternMap[filters.treadPattern.toLowerCase()] !== undefined) {
        whereConditions.push('ts.Protektor = @treadPattern');
      }
    }
    if (userId) {
      whereConditions.push(`
        pr.CustomerPointID IN (
          SELECT cp_sub.ID FROM CustomerPoints cp_sub
          JOIN UserToCustomerGroupPolicies utg ON utg.CustomerId = cp_sub.CustomerID
          WHERE utg.UserId = @userId
        )
      `);
    }
    if (hasTireSizes) {
      const sizeConditions: string[] = [];
      const addSize = (prefix: string, w?: number, h?: number, d?: number) => {
        const parts: string[] = [];
        if (w !== undefined) parts.push(`tsc.Width = @${prefix}Width`);
        if (h !== undefined) parts.push(`tsc.Height = @${prefix}Height`);
        if (d !== undefined) parts.push(`tsc.Diameter = @${prefix}Diameter`);
        if (parts.length) sizeConditions.push(`(${parts.join(' AND ')})`);
      };
      addSize('sz1', filters.width1, filters.height1, filters.diameter1);
      addSize('sz2', filters.width2, filters.height2, filters.diameter2);
      if (sizeConditions.length)
        whereConditions.push(`(${sizeConditions.join(' OR ')})`);
    }

    const selectColumns = [
      'p.ID as id',
      'p.ID as productId',
      'ISNULL(cp.CustomerID, 0) as customerId',
      "ISNULL(cust.Name, '') as customerName",
      'c.Name as category',
      'c.ID as categoryId',
      'm.Name as name',
      `ISNULL(${priceCol}, 0) as price`,
      'ISNULL(pr.Quantity, 0) as quantity',
      'ISNULL(pr.Reserved, 0) as reserved',
      "ISNULL(cp.PointName, '') as customerPoint",
      "ISNULL(pr.Code, '') as code",
      hasTireSizes
        ? "CASE WHEN pa.Season = 0 THEN 'summer' WHEN pa.Season = 1 THEN 'winter' WHEN pa.Season = 2 THEN 'allseason' ELSE '' END as season"
        : "'' as season",
      "ISNULL(pr.Comment, '') as comment",
      'm.ID as modelId',
      'm.Name as modelName',
      'v.ID as vendorId',
    ];

    const fromJoins: string[] = [
      'FROM Products p',
      'JOIN Models m ON m.ID = p.ModelID',
      'JOIN Vendors v ON v.ID = m.VendorID',
      'JOIN Categories c ON c.ID = v.CategoryID',
    ];
    if (hasPriceActual) {
      fromJoins.push('LEFT JOIN PriceActual pa ON pa.ProductID = p.ID');
    }
    if (hasTireSizes) {
      fromJoins.push(
        'LEFT JOIN TireTypesizesCube tsc ON tsc.FullSizeCaption = pa.FullSizeCaption',
      );
      fromJoins.push(
        'LEFT JOIN TireTypesizes ts ON ts.Width = tsc.Width AND ts.Height = tsc.Height AND ts.Diameter = tsc.Diameter',
      );
    }
    fromJoins.push(`OUTER APPLY (
      SELECT TOP 1 WholesalePrice, RetailPrice, Quantity, Reserved, Code, Comment, CustomerPointID
      FROM ProductsRelations WHERE ProductID = p.ID ORDER BY LastUpdate DESC
    ) pr`);
    fromJoins.push('LEFT JOIN CustomerPoints cp ON cp.ID = pr.CustomerPointID');
    fromJoins.push('LEFT JOIN Customers cust ON cust.ID = cp.CustomerID');

    const queryStr = [
      'SELECT',
      selectColumns.join(',\n           '),
      ...fromJoins,
      `WHERE ${whereConditions.join(' AND ')}`,
      orderByClause,
      'OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY',
    ].join('\n      ');

    const countStr = [
      'SELECT COUNT(*) as total',
      ...fromJoins,
      `WHERE ${whereConditions.join(' AND ')}`,
    ].join('\n      ');

    const buildRequest = (req: sql.Request) => {
      req.input('category', sql.VarChar, category);
      if (filters.brand?.length) {
        filters.brand.forEach((name, i) =>
          req.input(`brand${i}`, sql.VarChar, name),
        );
      }
      if (hasPriceActual && filters.spikes !== undefined) {
        req.input('spikes', sql.Bit, filters.spikes);
      }
      if (hasPriceActual && filters.runFlat !== undefined) {
        req.input('runFlat', sql.Bit, filters.runFlat);
      }
      if (hasPriceActual && filters.season?.length) {
        const seasonMap: Record<string, number> = {
          summer: 0,
          winter: 1,
          allseason: 2,
        };
        filters.season.forEach((s, i) =>
          req.input(`season${i}`, sql.Int, seasonMap[s] ?? 0),
        );
      }
      if (filters.priceMin !== undefined) {
        req.input('priceMin', sql.Float, filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        req.input('priceMax', sql.Float, filters.priceMax);
      }
      if (filters.minQuantity !== undefined) {
        req.input('minQuantity', sql.Int, filters.minQuantity);
      }
      if (hasTireSizes && filters.treadPattern !== undefined) {
        const treadPatternMap: Record<string, number> = {
          симметричный: 0,
          направленный: 1,
          асимметричный: 2,
        };
        req.input(
          'treadPattern',
          sql.Int,
          treadPatternMap[filters.treadPattern.toLowerCase()] ?? 0,
        );
      }
      if (userId) {
        req.input('userId', sql.VarChar, userId);
      }
      if (hasTireSizes) {
        if (filters.width1 !== undefined)
          req.input('sz1Width', sql.Float, filters.width1);
        if (filters.height1 !== undefined)
          req.input('sz1Height', sql.Float, filters.height1);
        if (filters.diameter1 !== undefined)
          req.input('sz1Diameter', sql.Float, filters.diameter1);
        if (filters.width2 !== undefined)
          req.input('sz2Width', sql.Float, filters.width2);
        if (filters.height2 !== undefined)
          req.input('sz2Height', sql.Float, filters.height2);
        if (filters.diameter2 !== undefined)
          req.input('sz2Diameter', sql.Float, filters.diameter2);
      }
      return req;
    };

    const countResult = await buildRequest(pool.request()).query(countStr);
    const total: number = countResult.recordset[0].total;

    const result = await buildRequest(pool.request())
      .input('offset', sql.Int, pagination.offset)
      .input('limit', sql.Int, pagination.limit)
      .query(queryStr);

    return { rows: result.recordset as ProductRawRow[], total };
  }
}
