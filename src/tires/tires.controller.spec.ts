import { Test, TestingModule } from '@nestjs/testing';
import { TiresController } from './tires.controller';
import { TiresService } from './tires.service';
import { Request } from 'express';
import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('TiresController', () => {
  let controller: TiresController;
  let tiresService: TiresService;
  let configService: ConfigService;

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

  // Mock request with all required headers
  const createMockRequest = (overrides: Partial<Request> = {}): Request => ({
    headers: {
      'x-domain': 'test.ru',
      'x-api-key': 'test-api-key',
      authorization: 'Bearer test-token',
      ...overrides.headers,
    },
  } as unknown as Request);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiresController],
      providers: [
        {
          provide: TiresService,
          useValue: {
            findAllPopularSize: jest.fn(),
            findAllPopularBrands: jest.fn(),
            findAllPopularBrandModels: jest.fn(),
          },
        },
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
            get: jest.fn().mockReturnValue('test-api-key,another-key'),
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ userId: 1, email: 'test@test.com' }),
          },
        },
      ],
    })
      .overrideGuard(XDomainGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(XApiKeyGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TiresController>(TiresController);
    tiresService = module.get<TiresService>(TiresService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('findAllPopularSize', () => {
    it('should return popular sizes successfully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(mockPopularSizes);

      // Act
      const result = await controller.findAllPopularSize(query, mockRequest);

      // Assert
      expect(result).toEqual(mockPopularSizes);
      expect(serviceSpy).toHaveBeenCalledWith(query, 'test.ru');
      expect(serviceSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined limitPerDiameter', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { minDiameter: 16, maxDiameter: 20 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(mockPopularSizes);

      // Act
      const result = await controller.findAllPopularSize(query, mockRequest);

      // Assert
      expect(result).toEqual(mockPopularSizes);
      expect(serviceSpy).toHaveBeenCalledWith(query, 'test.ru');
    });

    it('should return null when service returns null', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(null);

      // Act
      const result = await controller.findAllPopularSize(query, mockRequest);

      // Assert
      expect(result).toBeNull();
      expect(serviceSpy).toHaveBeenCalledWith(query, 'test.ru');
    });
  });

  describe('findAllPopularBrands', () => {
    it('should return popular brands successfully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { limit: 5 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrands')
        .mockResolvedValue(mockPopularBrands);

      // Act
      const result = await controller.findAllPopularBrands(query, mockRequest);

      // Assert
      expect(result).toEqual(mockPopularBrands);
      expect(serviceSpy).toHaveBeenCalledWith(5, 'test.ru');
      expect(serviceSpy).toHaveBeenCalledTimes(1);
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = {};
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrands')
        .mockResolvedValue(mockPopularBrands);

      // Act
      const result = await controller.findAllPopularBrands(query, mockRequest);

      // Assert
      expect(result).toEqual(mockPopularBrands);
      expect(serviceSpy).toHaveBeenCalledWith(10, 'test.ru');
    });

    it('should return null when service returns null', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { limit: 5 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrands')
        .mockResolvedValue(null);

      // Act
      const result = await controller.findAllPopularBrands(query, mockRequest);

      // Assert
      expect(result).toBeNull();
      expect(serviceSpy).toHaveBeenCalledWith(5, 'test.ru');
    });
  });

  describe('findAllPopularBrandModels', () => {
    it('should return brand models successfully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const brandId = 'michelin';
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrandModels')
        .mockResolvedValue(mockBrandModels);

      // Act
      const result = await controller.findAllPopularBrandModels(brandId, mockRequest);

      // Assert
      expect(result).toEqual(mockBrandModels);
      expect(serviceSpy).toHaveBeenCalledWith(brandId, 'test.ru');
      expect(serviceSpy).toHaveBeenCalledTimes(1);
    });

    it('should return null when service returns null', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const brandId = 'michelin';
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrandModels')
        .mockResolvedValue(null);

      // Act
      const result = await controller.findAllPopularBrandModels(brandId, mockRequest);

      // Assert
      expect(result).toBeNull();
      expect(serviceSpy).toHaveBeenCalledWith(brandId, 'test.ru');
    });

    it('should handle empty brandId', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const brandId = '';
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularBrandModels')
        .mockResolvedValue(mockBrandModels);

      // Act
      const result = await controller.findAllPopularBrandModels(brandId, mockRequest);

      // Assert
      expect(result).toEqual(mockBrandModels);
      expect(serviceSpy).toHaveBeenCalledWith(brandId, 'test.ru');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.findAllPopularSize(query, mockRequest)).rejects.toThrow('Database error');
      expect(serviceSpy).toHaveBeenCalledWith(query, 'test.ru');
    });
  });

  describe('Header Processing', () => {
    it('should extract x-domain header correctly', async () => {
      // Arrange
      const mockRequest = createMockRequest({ headers: { 'x-domain': 'custom.ru' } });
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(mockPopularSizes);

      // Act
      await controller.findAllPopularSize(query, mockRequest);

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(query, 'custom.ru');
    });

    it('should handle different x-domain header formats', async () => {
      // Arrange
      const mockRequest = createMockRequest({ headers: { 'x-domain': 'test.by' } });
      const query = { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 };
      const serviceSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(mockPopularSizes);

      // Act
      await controller.findAllPopularSize(query, mockRequest);

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(query, 'test.by');
    });
  });
});
