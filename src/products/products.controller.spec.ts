import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
// import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { AuthGuard } from 'src/guards/auth.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  // Mock data
  const mockProducts = {
    success: true,
    data: [
      {
        id: 'test-id-1',
        productId: 1,
        customerId: 1,
        customerName: 'Test Customer',
        category: 'Tires',
        categoryId: 1,
        name: 'Test Tire',
        price: 100,
        quantity: 10,
        reserved: 0,
        customerPoint: 'Test Point',
        code: 'TEST001',
        season: 'Summer',
        comment: 'Test comment',
        model: {
          id: 1,
          name: 'Test Model',
          vendorId: 1,
          photos: [],
        },
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

  // Mock request with all required headers
  const createMockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      headers: {
        'x-domain': 'test.ru',
        'x-api-key': 'test-api-key',
        authorization: 'Bearer test-token',
        ...overrides.headers,
      },
    }) as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAllProductsByCategory: jest.fn(),
          },
        },
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
            get: jest.fn().mockReturnValue('test-api-key,another-key'),
            getOrThrow: jest
              .fn()
              .mockReturnValue(
                'your-super-secret-jwt-key-here-change-in-production',
              ),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest
              .fn()
              .mockResolvedValue({ userId: 1, email: 'test@test.com' }),
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

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('findAllProductsByCategory', () => {
    it('should return products by category successfully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const serviceSpy = jest
        .spyOn(productsService, 'findAllProductsByCategory')
        .mockResolvedValue(mockProducts);

      // Act
      const result = await controller.findAllProductsByCategory(
        mockQuery,
        mockRequest,
      );

      // Assert
      expect(result).toEqual(mockProducts);
      expect(serviceSpy).toHaveBeenCalledWith(mockQuery, 'test.ru');
      expect(serviceSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockRequest = createMockRequest();
      const serviceSpy = jest
        .spyOn(productsService, 'findAllProductsByCategory')
        .mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        controller.findAllProductsByCategory(mockQuery, mockRequest),
      ).rejects.toThrow('Database error');
      expect(serviceSpy).toHaveBeenCalledWith(mockQuery, 'test.ru');
    });

    it('should extract x-domain header correctly', async () => {
      // Arrange
      const mockRequest = createMockRequest({
        headers: { 'x-domain': 'custom.ru' },
      });
      const serviceSpy = jest
        .spyOn(productsService, 'findAllProductsByCategory')
        .mockResolvedValue(mockProducts);

      // Act
      await controller.findAllProductsByCategory(mockQuery, mockRequest);

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(mockQuery, 'custom.ru');
    });
  });
});
