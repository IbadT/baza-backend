import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TiresController (e2e)', () => {
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

  describe('/api/tires/popular-sizes (GET)', () => {
    it('should return popular sizes', () => {
      return request(app.getHttpServer())
        .get('/api/tires/popular-sizes')
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .set('Authorization', 'Bearer test-jwt-token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('popularSizes');
          expect(Array.isArray(res.body.popularSizes)).toBe(true);
        });
    });

    it('should return 401 without API key', () => {
      return request(app.getHttpServer())
        .get('/api/tires/popular-sizes')
        .set('X-Domain', 'domain.ru')
        .expect(401);
    });
  });

  describe('/api/tires/popular-brands (GET)', () => {
    it('should return popular brands', () => {
      return request(app.getHttpServer())
        .get('/api/tires/popular-brands')
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .set('Authorization', 'Bearer test-jwt-token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('popularBrands');
          expect(Array.isArray(res.body.popularBrands)).toBe(true);
        });
    });
  });

  describe('/api/tires/brand-models/:brandId (GET)', () => {
    it('should return brand models', () => {
      return request(app.getHttpServer())
        .get('/api/tires/brand-models/michelin')
        .set('X-Domain', 'domain.ru')
        .set('X-API-Key', 'test-api-key-123')
        .set('Authorization', 'Bearer test-jwt-token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('brand');
          expect(res.body).toHaveProperty('models');
          expect(Array.isArray(res.body.models)).toBe(true);
        });
    });
  });
});
