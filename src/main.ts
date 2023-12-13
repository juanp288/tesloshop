import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('AppStarted')
  
  app.setGlobalPrefix('api/v2');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  await app.listen(+process.env.ENV_PORT);
  logger.log(`App running on port ${process.env.ENV_PORT}`)
}
bootstrap();
