import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: cfg.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    credentials: true,
  });
  const port = cfg.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port} from ${process.cwd()}`);
  console.log(`📁 Working directory: ${__dirname}`);
}
bootstrap();
