import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/products (GET)', () => {
    it('should return tires products with filters', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({
          category: 'tires',
          width1: 205,
          height1: 55,
          diameter1: 16,
          brand: 'MICHELIN',
          season: 'summer',
          priceMin: 5000,
          priceMax: 20000,
          page: 1,
          limit: 10,
          sortBy: 'price_asc',
        })
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return wheels products', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({
          category: 'wheels',
          page: 1,
          limit: 5,
        })
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          // Wheels should have null price fields
          if (res.body.data.length > 0) {
            expect(res.body.data[0]).toHaveProperty('WholePrice', null);
            expect(res.body.data[0]).toHaveProperty('CategoryURL', 'wheels');
          }
        });
    });

    it('should return 401 without API key', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ category: 'tires' })
        .set('X-Domain', 'domain.ru')
        .expect(401);
    });

    it('should return 400 for invalid category', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ category: 'invalid' })
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .expect(400);
    });

    it('should handle single brand parameter', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({
          category: 'tires',
          brand: 'MICHELIN', // Single brand instead of array
          page: 1,
          limit: 5,
        })
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
