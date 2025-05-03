// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS if needed
  app.enableCors();
  
  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();