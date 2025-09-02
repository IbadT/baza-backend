import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';
import { GetProductQueryDTO } from './dto/get-product-query.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let cacheService: CacheService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
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
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    cacheService = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockQuery: GetProductQueryDTO = {
        category: 'tires',
        page: 1,
        limit: 10,
        sortdBy: 'price_asc',
      };

      const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(cacheService, 'set')
        .mockResolvedValue(undefined);
      const configSpy = jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValue('3600');

      const result = await service.findAllProductsByCategory(
        mockQuery,
        'test.com',
      );

      expect(result).toBeDefined();
      expect(getSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
      expect(configSpy).toHaveBeenCalled();
    });
  });
});
