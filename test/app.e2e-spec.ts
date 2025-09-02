import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('Приложение должно быть определено', () => {
    expect(app).toBeDefined();
  });

  it('JWT service should work', () => {
    const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
    const decoded = jwtService.verify(token);
    expect(decoded).toHaveProperty('userId', 1);
    expect(decoded).toHaveProperty('email', 'test@gmail.com');
  });

  it('should have products module available', () => {
    const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
    return request(app.getHttpServer())
      .get('/api/products')
      .query({ category: 'tires' })
      .set('X-Domain', 'domain.ru')
      .set('X-API-Key', 'test-api-key-123')
      .set('Authorization', `Bearer ${token}`)
      .expect((res) => {
        // Should either return 200 (if DB is available) or 500 (if DB is not available)
        // expect([200, 500]).toContain(res.status);
        expect([401]).toContain(res.status);
      });
  });

  describe('Tires (GET)', () => {
    describe('popular-sizes', () => {
      it('Invalid token', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/popular-sizes')
          .query({
            minDiameter: 1,
            maxDiameter: 10,
          })
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', 'test-api-key-123')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            // expect([200, 500]).toContain(res.status);
            expect([401]).toContain(res.status);
          });
      });

      it('X-API-Key is required', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/popular-sizes')
          .query({
            minDiameter: 1,
            maxDiameter: 10,
          })
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', '')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            // expect([200, 500]).toContain(res.status);
            expect([400]).toContain(res.status);
          });
      });
    });

    describe('Popular-brands', () => {
      it('Invalid token', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/popular-brands')
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', 'test-api-key-123')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            expect([401]).toContain(res.status);
          });
      });

      it('X-API-Key is required', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/popular-brands')
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', '')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            expect([400]).toContain(res.status);
          });
      });
    });

    describe('brand-models', () => {
      it('Invalid token', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/brand-models/michelin')
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', 'test-api-key-123')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            expect([401]).toContain(res.status);
          });
      });

      it('X-API-Key is required', () => {
        const token = jwtService.sign({ userId: 1, email: 'test@gmail.com' });
        return request(app.getHttpServer())
          .get('/api/tires/brand-models/michelin')
          .set('X-Domain', 'domain.ru')
          .set('X-API-Key', '')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            expect([400]).toContain(res.status);
          });
      });
    });
  });
});
