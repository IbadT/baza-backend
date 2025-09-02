import { Test, TestingModule } from '@nestjs/testing';
import { TiresService } from './tires.service';
import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

// Mock mssql module
jest.mock('mssql', () => ({
  connect: jest.fn(),
  Int: 'Int',
}));

describe('TiresService', () => {
  let service: TiresService;
  let cacheService: CacheService;
  let configService: ConfigService;
  let mockPool: any;

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

    (sql.connect as jest.Mock).mockResolvedValue(mockPool);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiresService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                DB_HOST: 'localhost',
                DB_DATABASE: 'testdb',
                DB_USERNAME: 'testuser',
                DB_PASSWORD: 'testpass',
                SECRET_TOKEN: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TiresService>(TiresService);
    cacheService = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
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
    it('should return cached data when available', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';
      const cacheSpy = jest
        .spyOn(cacheService, 'get')
        .mockResolvedValue(mockPopularSizes);

      // Act
      const result = await service.findAllPopularSize(query, xDomain);

      // Assert
      expect(result).toEqual(mockPopularSizes);
      expect(cacheSpy).toHaveBeenCalledWith(
        'popular-sizes',
        query.minDiameter,
        query.maxDiameter,
        query.limitPerDiameter,
        xDomain,
      );
      expect(sql.connect).not.toHaveBeenCalled();
    });

    it('should query database when cache is empty', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';
      const cacheSpy = jest
        .spyOn(cacheService, 'get')
        .mockResolvedValue(null);
      const setCacheSpy = jest
        .spyOn(cacheService, 'set')
        .mockResolvedValue(undefined);

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

      // Act
      const result = await service.findAllPopularSize(query, xDomain);

      // Assert
      expect(result).toBeDefined();
      expect(cacheSpy).toHaveBeenCalled();
      expect(setCacheSpy).toHaveBeenCalled();
      expect(sql.connect).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
    });

    it('should use default limitPerDiameter when not provided', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20 };
      const xDomain = 'test.ru';
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

      const mockResult = { recordset: [] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllPopularSize(query, xDomain);

      // Assert
      expect(mockPool.request().input).toHaveBeenCalledWith('limitPerDiameter', 'Int', 5);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      (sql.connect as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.findAllPopularSize(query, xDomain)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findAllPopularBrands', () => {
    it('should return cached data when available', async () => {
      // Arrange
      const limit = 5;
      const xDomain = 'test.ru';
      const cacheSpy = jest
        .spyOn(cacheService, 'get')
        .mockResolvedValue(mockPopularBrands);

      // Act
      const result = await service.findAllPopularBrands(limit, xDomain);

      // Assert
      expect(result).toEqual(mockPopularBrands);
      expect(cacheSpy).toHaveBeenCalledWith('popular-brands', limit, xDomain);
      expect(sql.connect).not.toHaveBeenCalled();
    });

    it('should query database when cache is empty', async () => {
      // Arrange
      const limit = 5;
      const xDomain = 'test.ru';
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

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

      // Act
      const result = await service.findAllPopularBrands(limit, xDomain);

      // Assert
      expect(result).toBeDefined();
      expect(sql.connect).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
    });
  });

  describe('findAllPopularBrandModels', () => {
    it('should return cached data when available', async () => {
      // Arrange
      const brandId = 'michelin';
      const xDomain = 'test.ru';
      const cacheSpy = jest
        .spyOn(cacheService, 'get')
        .mockResolvedValue(mockBrandModels);

      // Act
      const result = await service.findAllPopularBrandModels(brandId, xDomain);

      // Assert
      expect(result).toEqual(mockBrandModels);
      expect(cacheSpy).toHaveBeenCalledWith('brand-models', brandId, xDomain);
      expect(sql.connect).not.toHaveBeenCalled();
    });

    it('should query database when cache is empty', async () => {
      // Arrange
      const brandId = 'michelin';
      const xDomain = 'test.ru';
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

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
      mockPool.request().query
        .mockResolvedValueOnce(mockBrandResult) // First call for brand query
        .mockResolvedValueOnce(mockResult);     // Second call for models query

      // Act
      const result = await service.findAllPopularBrandModels(brandId, xDomain);

      // Assert
      expect(result).toBeDefined();
      expect(sql.connect).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should use correct database configuration', async () => {
      // Arrange
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const xDomain = 'test.ru';
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

      const mockResult = { recordset: [] };
      mockPool.request().query.mockResolvedValue(mockResult);

      // Act
      await service.findAllPopularSize(query, xDomain);

      // Assert
      expect(configService.getOrThrow).toHaveBeenCalledWith('DB_HOST');
      expect(configService.getOrThrow).toHaveBeenCalledWith('DB_DATABASE');
      expect(configService.getOrThrow).toHaveBeenCalledWith('DB_USERNAME');
      expect(configService.getOrThrow).toHaveBeenCalledWith('DB_PASSWORD');
    });
  });
});
