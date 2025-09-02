import { Test, TestingModule } from '@nestjs/testing';
import { TiresController } from './tires.controller';
import { TiresService } from './tires.service';
import { Request } from 'express';

describe('TiresController', () => {
  let controller: TiresController;
  let tiresService: TiresService;

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
      ],
    }).compile();

    controller = module.get<TiresController>(TiresController);
    tiresService = module.get<TiresService>(TiresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllPopularSize', () => {
    it('should return popular sizes', async () => {
      const mockRequest = {
        headers: {
          'x-domain': 'test.com',
        },
      } as Partial<Request> as Request;

      const mockSizes = {
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

      const sizeSpy = jest
        .spyOn(tiresService, 'findAllPopularSize')
        .mockResolvedValue(mockSizes);

      const result = await controller.findAllPopularSize(
        { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 },
        mockRequest,
      );

      expect(result).toEqual(mockSizes);
      expect(sizeSpy).toHaveBeenCalledWith(
        { minDiameter: 16, maxDiameter: 20, limitPerDiameter: 3 },
        'test.com',
      );
    });
  });

  describe('findAllPopularBrands', () => {
    it('should return popular brands', async () => {
      const mockRequest = {
        headers: {
          'x-domain': 'test.com',
        },
      } as Partial<Request> as Request;

      const mockBrands = {
        popularBrands: [
          {
            id: 'michelin',
            name: 'Michelin',
            popularity: 100,
            logoUrl: '/brands/michelin.png',
          },
        ],
      };

      const brandsSpy = jest
        .spyOn(tiresService, 'findAllPopularBrands')
        .mockResolvedValue(mockBrands);

      const result = await controller.findAllPopularBrands(
        { limit: 5 },
        mockRequest,
      );

      expect(result).toEqual(mockBrands);
      expect(brandsSpy).toHaveBeenCalledWith(5, 'test.com');
    });
  });

  describe('findAllPopularBrandModels', () => {
    it('should return brand models', async () => {
      const mockRequest = {
        headers: {
          'x-domain': 'test.com',
        },
      } as Partial<Request> as Request;

      const mockModels = {
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

      const modelsSpy = jest
        .spyOn(tiresService, 'findAllPopularBrandModels')
        .mockResolvedValue(mockModels);

      const result = await controller.findAllPopularBrandModels(
        'michelin',
        mockRequest,
      );

      expect(result).toEqual(mockModels);
      expect(modelsSpy).toHaveBeenCalledWith('michelin', 'test.com');
    });
  });
});
