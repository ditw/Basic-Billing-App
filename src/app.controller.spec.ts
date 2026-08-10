import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'GLOBAL_PREFIX') return 'v1';
              return null;
            }),
          },
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('getAppInfo', () => {
    it('should return app info metadata', () => {
      expect(appController.getAppInfo()).toEqual({
        service: 'basic-billing-app',
        status: 'online',
        version: '1.0.0',
        documentation: '/api',
        apiPrefix: 'v1',
      });
    });
  });
});
