import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
// import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
import { DatabaseService } from 'src/database/database.service';
import * as sql from 'mssql';

describe('ProductsService', () => {
  let service: ProductsService;
  // let cacheService: CacheService;
  let configService: ConfigService;
  let databaseService: DatabaseService;
  let mockPool: {
    request: jest.Mock;
  };

  // Mock data
  const mockProducts = {
    success: true,
    data: [
      {
        ID: 1,
        ModelID: 1,
        AdditionalSpecifications: null,
        Specifications: null,
        ModelName: 'Test Tire',
        VendorName: 'Test Vendor',
        CategoryName: 'Tires',
        CategoryURL: 'tires',
        PriceVendor: 'Test Price Vendor',
        PriceModelName: 'Test Price Model',
        FullSizeCaption: '205/55R16',
        PriceAdditionalSpecs: null,
        Season: 0,
        Indexes: '91V',
        Runflat: false,
        Spikes: false,
        WholePrice: 100,
        Quantity: 10,
      },
    ],
    count: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockQuery: GetProductQueryDTO = {
    category: 'tires',
    page: 1,
    limit: 10,
    sortBy: 'price_asc',
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock pool and request
    mockPool = {
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn(),
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        // {
        //   provide: CacheService,
        //   useValue: {
        //     get: jest.fn(),
        //     set: jest.fn(),
        //   },
        // },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                DB_HOST: 'localhost',
                DB_DATABASE: 'testdb',
                DB_USERNAME: 'testuser',
                DB_PASSWORD: 'testpass',
                REDIS_DEFAULT_PRODUCTS_TTL: '300',
              };
              return config[key];
            }),
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                PHOTOS_BASE_URL: 'https://example.com/images/',
              };
              return config[key];
            }),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            getPool: jest.fn().mockReturnValue(mockPool),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
    // cacheService = moduleRef.get<CacheService>(CacheService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findAllProductsByCategory', () => {
    it('should return tire products when category is tires', async () => {
      // Arrange
      const xDomain = 'test.ru';
      const mockResult = {
        recordset: [
          {
            ID: 1,
            ModelID: 1,
            AdditionalSpecifications: null,
            Specifications: null,
            ModelName: 'Test Tire',
            VendorName: 'Test Vendor',
            CategoryName: 'Tires',
            CategoryURL: 'tires',
            PriceVendor: 'Test Price Vendor',
            PriceModelName: 'Test Price Model',
            FullSizeCaption: '205/55R16',
            PriceAdditionalSpecs: null,
            Season: 0,
            Indexes: '91V',
            Runflat: false,
            Spikes: false,
            WholePrice: 100,
            Quantity: 10,
          },
        ],
        rowsAffected: [1],
      };

      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAllProductsByCategory(
        mockQuery,
        xDomain,
      );

      // Assert
      expect(result).toBeDefined();
      expect((result as any)?.success).toBe(true);
      expect((result as any)?.data).toHaveLength(1);
      expect(mockPool.request).toHaveBeenCalled();
    });

    it('should return wheel products when category is wheels', async () => {
      // Arrange
      const wheelQuery: GetProductQueryDTO = {
        category: 'wheels',
        page: 1,
        limit: 10,
        sortBy: 'price_asc',
      };
      const xDomain = 'test.ru';
      const mockResult = {
        recordset: [
          {
            ID: 2,
            ModelID: 2,
            AdditionalSpecifications: null,
            Specifications: null,
            ModelName: 'Test Wheel',
            VendorName: 'Test Vendor',
            CategoryName: 'Wheels',
            CategoryURL: 'wheels',
            PriceVendor: 'Test Price Vendor',
            PriceModelName: 'Test Price Model',
            FullSizeCaption: '16x7',
            PriceAdditionalSpecs: null,
            Season: 0,
            Indexes: null,
            Runflat: null,
            Spikes: null,
            WholePrice: 200,
            Quantity: 5,
          },
        ],
        rowsAffected: [1],
      };

      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAllProductsByCategory(
        wheelQuery,
        xDomain,
      );

      // Assert
      expect(result).toBeDefined();
      expect((result as any)?.success).toBe(true);
      expect((result as any)?.data).toHaveLength(1);
      expect(mockPool.request).toHaveBeenCalled();
    });

    it('should handle different sorting options correctly', async () => {
      // Arrange
      const sortQuery: GetProductQueryDTO = {
        category: 'tires',
        page: 1,
        limit: 10,
        sortBy: 'price_desc',
      };
      const xDomain = 'test.ru';
      const mockResult = { recordset: [], rowsAffected: [0] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllProductsByCategory(sortQuery, xDomain);

      // Assert
      expect(mockPool.request().query).toHaveBeenCalledWith(
        expect.stringContaining(
          'ORDER BY CASE WHEN pa.WholePrice IS NULL THEN 1 ELSE 0 END, pa.WholePrice DESC',
        ),
      );
    });

    it('should use default sorting when sortBy is not provided', async () => {
      // Arrange
      const defaultQuery: GetProductQueryDTO = {
        category: 'tires',
        page: 1,
        limit: 10,
      };
      const xDomain = 'test.ru';
      const mockResult = { recordset: [], rowsAffected: [0] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllProductsByCategory(defaultQuery, xDomain);

      // Assert
      expect(mockPool.request().query).toHaveBeenCalledWith(
        expect.stringContaining(
          'ORDER BY CASE WHEN pa.WholePrice IS NULL THEN 1 ELSE 0 END, pa.WholePrice ASC',
        ),
      );
    });

    it('should calculate pagination correctly', async () => {
      // Arrange
      const paginationQuery: GetProductQueryDTO = {
        category: 'tires',
        page: 3,
        limit: 5,
        sortBy: 'price_asc',
      };
      const xDomain = 'test.ru';
      const mockResult = { recordset: [], rowsAffected: [0] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllProductsByCategory(paginationQuery, xDomain);

      // Assert
      expect(mockPool.request().input).toHaveBeenCalledWith(
        'offset',
        sql.Int,
        10,
      );
      expect(mockPool.request().input).toHaveBeenCalledWith(
        'limit',
        sql.Int,
        5,
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const xDomain = 'test.ru';
      (databaseService.getPool as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Act & Assert
      await expect(
        service.findAllProductsByCategory(mockQuery, xDomain),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle empty results', async () => {
      // Arrange
      const xDomain = 'test.ru';
      const mockResult = { recordset: [], rowsAffected: [0] };

      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAllProductsByCategory(
        mockQuery,
        xDomain,
      );

      // Assert
      expect(result).toBeDefined();
      expect((result as any)?.success).toBe(true);
      expect((result as any)?.data).toHaveLength(0);
      expect((result as any)?.count).toBe(0);
    });
  });

  // describe('Configuration', () => {
  //   it('should use correct redis ttl configuration', async () => {
  //     // Arrange
  //     const xDomain = 'test.ru';
  //     const mockResult = { recordset: [], rowsAffected: [0] };
  //     mockPool.request().query.mockResolvedValue(mockResult);
  //
  //     // Act
  //     await service.findAllProductsByCategory(mockQuery, xDomain);
  //
  //     // Assert
  //     expect(configService.getOrThrow).toHaveBeenCalledWith(
  //       'REDIS_DEFAULT_PRODUCTS_TTL',
  //     );
  //   });
  // });
});
