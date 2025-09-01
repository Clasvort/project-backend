import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global pipes
  app.useGlobalPipes(new CustomValidationPipe());
  
  // CORS configuration for production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://subtle-jelly-80f70b.netlify.app'] 
      : ['http://localhost:5173', 'http://localhost:3000','https://subtle-jelly-80f70b.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Trust proxy for Render
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/v1`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
