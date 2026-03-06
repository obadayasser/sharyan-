import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['*'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Sharyan API - شريان')
    .setDescription('Blood Donation Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'X-Device-ID', in: 'header' },
      'device-id',
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-User-Type', in: 'header' },
      'user-type',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Sharyan API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
