import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { GetProductQueryDTO } from './dto/get-product-query.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

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
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockRequest = {
        headers: {
          'x-domain': 'test.com',
        },
      } as Partial<Request> as Request;

      const mockQuery: GetProductQueryDTO = {
        category: 'tires',
        page: 1,
        limit: 10,
        sortdBy: 'price_asc',
      };

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

      const categorySpy = jest
        .spyOn(productsService, 'findAllProductsByCategory')
        .mockResolvedValue(mockProducts);

      const result = await controller.findAllProductsByCategory(
        mockQuery,
        mockRequest,
      );

      expect(result).toEqual(mockProducts);
      expect(categorySpy).toHaveBeenCalledWith(mockQuery, 'test.com');
    });
  });

  describe('getError', () => {
    it('should throw an error', () => {
      expect(() => controller.getError()).toThrow('My first Sentry error!');
    });
  });
});
