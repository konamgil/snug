import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true, // CVE-2019-18413 protection
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Snug API')
    .setDescription('Room rental platform for foreigners - API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('rooms', 'Room listing endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('chat', 'Real-time chat endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // CORS configuration - 여러 origin 지원
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5757')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없는 경우 (같은 origin 요청, Postman 등) 허용
      if (!origin) {
        callback(null, true);
        return;
      }
      // 허용된 origin 목록에 있는지 확인
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Get port from config (Render provides PORT)
  const configService = app.get(ConfigService);
  const port =
    Number.parseInt(process.env.PORT ?? '', 10) || configService.get<number>('API_PORT') || 4000;

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Snug API is running on: http://localhost:${port}`);
  logger.log(`📚 API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
