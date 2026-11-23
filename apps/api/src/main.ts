import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/** Shared setup, also used by e2e tests so they test the real configuration. */
export function configureApp(app: INestApplication) {
  app.enableCors({ origin: process.env.WEB_ORIGIN?.split(',') ?? 'http://localhost:3000' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip fields that are not in the DTO
      forbidNonWhitelisted: true, // ...and reject the request if someone sends them
      transform: true,
    }),
  );
  return app;
}

async function bootstrap() {
  const app = configureApp(await NestFactory.create(AppModule));

  const swagger = new DocumentBuilder()
    .setTitle('BriefBoard API')
    .setDescription('Client briefs and project pipeline for a creative studio')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API on http://localhost:${port}  ·  Swagger: http://localhost:${port}/docs`);
}

if (require.main === module) void bootstrap();
