import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config: any = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('User management system')
    .setDescription(
      'This is the official User management API document for skywallet assessment',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:8000/v1/api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('v1/api');
  app.enableCors();
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
