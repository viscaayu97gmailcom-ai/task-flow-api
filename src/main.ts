import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
  const hasExplicitOrigins =
    allowedOrigins.length > 0 && !allowedOrigins.includes('*');

  app.enableCors({
    origin: hasExplicitOrigins ? allowedOrigins : '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: hasExplicitOrigins,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();