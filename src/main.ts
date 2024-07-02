import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Telegram Analog')
    .setDescription('Telegram Analog API description')
    .setVersion('1.0')
    .addTag('tgexample')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Validation Pipes
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

bootstrap();
