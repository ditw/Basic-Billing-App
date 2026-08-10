import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@app/app.module';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@app/common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX', '');

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix, {
      exclude: ['/', `/${globalPrefix}`],
    });
  }

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Basic Billing API')
    .setDescription('Microservice for managing accounts, currencies, and billing calculations.')
    .setVersion('1.0.0')
    .addTag('Currencies', 'Manage supported account currencies')
    .addTag('Accounts', 'Manage user accounts and discount rules')
    .addTag('Billing', 'Calculate monthly billings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
    },
  });

  await app.listen(port, host);

  logger.log(`Application is running on: http://${host}:${port}/${globalPrefix}`);
  logger.log(`Swagger UI is available at: http://${host}:${port}/api`);
}

bootstrap().catch((err) => {
  logger.error('Application failed to start:', err);
  process.exit(1);
});
