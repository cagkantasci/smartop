import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smartop API')
    .setDescription(
      `
## Smartop Fleet Management API

Smartop is a comprehensive fleet management system for construction equipment.

### Features:
- **Authentication**: JWT-based auth with refresh tokens
- **Organizations**: Multi-tenant organization management
- **Users**: Role-based access control (admin, manager, operator)
- **Machines**: Equipment tracking with location and status
- **Checklists**: Daily inspection templates and submissions
- **Jobs**: Project/site management with machine assignments

### Authentication
All endpoints (except login/register) require a valid JWT token.
Include the token in the Authorization header: \`Bearer <token>\`
    `,
    )
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Organizations', 'Organization management')
    .addTag('Machines', 'Machine/equipment management')
    .addTag('Checklists', 'Checklist templates and submissions')
    .addTag('Jobs', 'Job/project management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Smartop API Documentation',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Smartop API is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
