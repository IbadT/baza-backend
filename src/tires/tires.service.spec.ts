import { Test, TestingModule } from '@nestjs/testing';
import { TiresService } from './tires.service';
import { CacheService } from 'src/cache/cacheService.service';
import { ConfigService } from '@nestjs/config';

describe('TiresService', () => {
  let service: TiresService;
  let cacheService: CacheService;
  let configService: ConfigService;

  beforeEach(async () => {
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
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TiresService>(TiresService);
    cacheService = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPopularSize', () => {
    it('should return popular sizes', async () => {
      const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(cacheService, 'set')
        .mockResolvedValue(undefined);
      const configSpy = jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValue('3600');

      const result = await service.findAllPopularSize(
        { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 },
        'test.com',
      );

      expect(result).toBeDefined();
      expect(getSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
      expect(configSpy).toHaveBeenCalled();
    });
  });

  describe('findAllPopularBrands', () => {
    it('should return popular brands', async () => {
      const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(cacheService, 'set')
        .mockResolvedValue(undefined);
      const configSpy = jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValue('3600');

      const result = await service.findAllPopularBrands(5, 'test.com');

      expect(result).toBeDefined();
      expect(getSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
      expect(configSpy).toHaveBeenCalled();
    });
  });

  describe('findAllPopularBrandModels', () => {
    it('should return brand models', async () => {
      const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      const setSpy = jest
        .spyOn(cacheService, 'set')
        .mockResolvedValue(undefined);
      const configSpy = jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValue('3600');

      const result = await service.findAllPopularBrandModels(
        'michelin',
        'test.com',
      );

      expect(result).toBeDefined();
      expect(getSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
      expect(configSpy).toHaveBeenCalled();
    });
  });
});
