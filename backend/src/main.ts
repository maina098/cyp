import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const apiOrigin = `http://localhost:${process.env.PORT ?? 3001}`;

  app.getHttpAdapter().getInstance().use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', apiOrigin],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  // CORS configuration
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const publicSiteOrigin = 'https://www.coastalyouthparliament.org';
  if (!allowedOrigins.includes(publicSiteOrigin)) {
    allowedOrigins.push(publicSiteOrigin);
  }
  const isAllowedOrigin = (origin?: string) =>
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https:\/\/(www\.)?coastalyouthparliament\.org$/.test(origin);

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prevent noisy 404 logs when browsers request /favicon.ico
  app.use((req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).end();
      return;
    }
    next();
  });

  // API Documentation (Swagger)
  const config = new DocumentBuilder()
    .setTitle('CYP Election API')
    .setDescription('Coastal Youth Parliament Election System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Health Check: http://localhost:${port}/health`);
}

bootstrap();
