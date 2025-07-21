import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>('PORT') || '3000', 10);

  await app.listen(port);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true, // Nếu field không hợp lế, ném lỗi 400 Bad Request
      transform: true, // Tự động ép kiểu
    }),
  );

  // Global exception filter
  // app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  });
}
bootstrap();
