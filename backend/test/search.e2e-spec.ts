import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mongoose } from 'mongoose';

describe('Search & Devices (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Search Endpoints', () => {
    it('/search (GET) - should return results for valid query', () => {
      return request(app.getHttpServer())
        .get('/search?q=iphone')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/search/autocomplete (GET) - should return suggestions', () => {
      return request(app.getHttpServer())
        .get('/search/autocomplete?q=iph')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Device Endpoints', () => {
    it('/devices/popular (GET) - should return popular devices', () => {
      return request(app.getHttpServer())
        .get('/devices/popular')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/devices/slug/:slug (GET) - should 404 for unknown slug', () => {
      return request(app.getHttpServer())
        .get('/devices/slug/non-existent-device-12345')
        .expect(404);
    });
  });
});
