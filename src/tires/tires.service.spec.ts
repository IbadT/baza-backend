import { Test, TestingModule } from '@nestjs/testing';
import { TiresService } from './tires.service';
// import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import * as sql from 'mssql';

describe('TiresService', () => {
  let service: TiresService;
  // let cacheService: CacheService;
  let configService: ConfigService;
  let databaseService: DatabaseService;
  let mockPool: {
    request: jest.Mock;
  };

  // Mock data
  const mockPopularSizes = {
    popularSizes: [
      {
        diameter: 16,
        sizes: [
          {
            width: 205,
            aspectRatio: 55,
            popularity: 100,
          },
        ],
      },
    ],
  };

  const mockPopularBrands = {
    popularBrands: [
      {
        id: 'michelin',
        name: 'Michelin',
        popularity: 100,
        logoUrl: '/brands/michelin.png',
      },
    ],
  };

  const mockBrandModels = {
    brand: {
      id: 'michelin',
      name: 'Michelin',
      logoUrl: '/brands/michelin.png',
    },
    models: [
      {
        id: 'pilot-sport',
        name: 'Pilot Sport',
        imageUrl: '/models/pilot-sport.jpg',
        season: 'summer',
      },
    ],
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
        TiresService,
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
                SECRET_TOKEN:
                  'your-super-secret-jwt-key-here-change-in-production',
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

    service = moduleRef.get<TiresService>(TiresService);
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

  describe('findAllPopularSize', () => {
    // it('should return cached data when available', async () => {
    //   const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
    //   const xDomain = 'test.ru';
    //   const cacheSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(mockPopularSizes);
    //   const result = await service.findAllPopularSize(query, xDomain);
    //   expect(result).toEqual(mockPopularSizes);
    //   expect(cacheSpy).toHaveBeenCalledWith('popular-sizes', query.minDiameter, query.maxDiameter, query.limitPerDiameter, xDomain);
    //   expect(databaseService.getPool).not.toHaveBeenCalled();
    // });

    it('should query database and return results', async () => {
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';

      const mockResult = {
        recordset: [
          {
            Diameter: 16,
            Width: 205,
            AspectRatio: 55,
            Popularity: 100,
          },
        ],
      };

      mockPool.request().query.mockResolvedValue(mockResult);

      const result = await service.findAllPopularSize(query, xDomain);

      expect(result).toBeDefined();
      expect(databaseService.getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
    });

    it('should use default limitPerDiameter when not provided', async () => {
      const query = { minDiameter: 16, maxDiameter: 20 };
      const xDomain = 'test.ru';

      const mockResult = { recordset: [] };
      mockPool.request().query.mockResolvedValue(mockResult);

      await service.findAllPopularSize(query, xDomain);

      expect(mockPool.request().input).toHaveBeenCalledWith(
        'limitPerDiameter',
        sql.Int,
        5,
      );
    });

    it('should handle database errors gracefully', async () => {
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';
      (databaseService.getPool as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(service.findAllPopularSize(query, xDomain)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAllPopularBrands', () => {
    // it('should return cached data when available', async () => {
    //   const limit = 5;
    //   const xDomain = 'test.ru';
    //   const cacheSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(mockPopularBrands);
    //   const result = await service.findAllPopularBrands(limit, xDomain);
    //   expect(result).toEqual(mockPopularBrands);
    //   expect(cacheSpy).toHaveBeenCalledWith('popular-brands', limit, xDomain);
    //   expect(databaseService.getPool).not.toHaveBeenCalled();
    // });

    it('should query database and return results', async () => {
      const limit = 5;
      const xDomain = 'test.ru';

      const mockResult = {
        recordset: [
          {
            ID: 1,
            Name: 'Michelin',
            Popularity: 100,
          },
        ],
      };

      mockPool.request().query.mockResolvedValue(mockResult);

      const result = await service.findAllPopularBrands(limit, xDomain);

      expect(result).toBeDefined();
      expect(databaseService.getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
    });
  });

  // describe('findAllPopularBrandModels', () => {
  //   it('should return cached data when available', async () => {
  //     // Arrange
  //     const brandId = 'michelin';
  //     const xDomain = 'test.ru';
  //
  //     // Act
  //     const result = await service.findAllPopularBrandModels(brandId, xDomain);
  //
  //     // Assert
  //     expect(result).toEqual(mockBrandModels);
  //     expect(databaseService.getPool).not.toHaveBeenCalled();
  //   });

  it('should query database when cache is empty', async () => {
    // Arrange
    const brandId = 'michelin';
    const xDomain = 'test.ru';

    const mockResult = {
      recordset: [
        {
          ID: 1,
          ModelName: 'Pilot Sport',
          Season: 1,
          SeasonName: 'Summer',
          rn: 1,
        },
      ],
    };

    // Mock brand query result
    const mockBrandResult = {
      recordset: [
        {
          ID: 1,
          Name: 'Michelin',
        },
      ],
    };

    // Mock the request method to return different results for different queries
    mockPool
      .request()
      .query.mockResolvedValueOnce(mockBrandResult) // First call for brand query
      .mockResolvedValueOnce(mockResult); // Second call for models query

    // Act
    const result = await service.findAllPopularBrandModels(brandId, xDomain);

    // Assert
    expect(result).toBeDefined();
    expect(databaseService.getPool).toHaveBeenCalled();
    expect(mockPool.request).toHaveBeenCalled();
  });
  // });

  describe('Configuration', () => {
    it('should use correct database configuration via DatabaseService', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';

      const mockResult = { recordset: [] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllPopularSize(query, xDomain);

      // Assert
      expect(databaseService.getPool).toHaveBeenCalled();
    });
  });
});
