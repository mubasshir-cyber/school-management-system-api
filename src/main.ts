import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  const globalPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // Global Interceptors and Filters
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('School Management ERP - REST API')
    .setDescription(
      'Comprehensive, multi-tenant, configuration-driven School Management System API.',
    )
    .setVersion('1.0')
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
    .addTag('Authentication', 'User authentication and session management')
    .addTag('RBAC', 'Roles, permissions, and scope management')
    .addTag('Tenants & Schools', 'Multi-tenant school and branch management')
    .addTag('Academic Structure', 'Academic years, classes, sections, subjects')
    .addTag('Students', 'Registration, admission, and student lifecycle')
    .addTag('Staff & HR', 'Employee management, departments, and designations')
    .addTag('Attendance', 'Student and staff attendance and leave tracking')
    .addTag('Fees & Ledger', 'Dynamic fee heads, billing, and double-entry ledger')
    .addTag('Payroll', 'Salary components, calculations, and payslips')
    .addTag('Examinations', 'Exams, marks entry, grades, and report cards')
    .addTag('Audit Logs', 'Immutable system audit trails')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 School ERP API is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Swagger Documentation: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
