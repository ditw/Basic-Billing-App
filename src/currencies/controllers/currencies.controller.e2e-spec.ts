import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CurrenciesModule } from '@app/currencies/currencies.module';
import { ConfigService } from '@nestjs/config';
import { Server } from 'net';
import { AppModule } from '@app/app.module';

describe('CurrenciesController (HTTP Integration)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let api: (path: string) => string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CurrenciesModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const configService = app.get(ConfigService);
    const prefix = configService.get<string>('GLOBAL_PREFIX', '');
    if (prefix) app.setGlobalPrefix(prefix);

    api = (path: string) => (prefix ? `/${prefix}${path}` : path);

    await app.init();

    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /currencies - should create a currency and return 201', async () => {
    const response = await request(httpServer)
      .post(api('/currencies'))
      .send({ currency: 'EUR', monthlyFeeGbp: 25.0 })
      .expect(201);

    expect(response.body).toEqual({
      currency: 'EUR',
      monthlyFeeGbp: 25.0,
    });
  });

  it('POST /currencies - should return 400 Bad Request if fields fail validation', async () => {
    await request(httpServer)
      .post(api('/currencies'))
      .send({ currency: '', monthlyFeeGbp: -5 }) // Invalid inputs
      .expect(400);
  });
});
